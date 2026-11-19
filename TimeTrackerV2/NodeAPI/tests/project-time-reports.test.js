const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const sqlite3 = require('sqlite3');

function execute(database, sql, params = []) {
    return new Promise((resolve, reject) => {
        database.run(sql, params, error => error ? reject(error) : resolve());
    });
}

// Use the real controller with an in-memory database, following the course-report tests.
function getProjectReport(database, projectID) {
    const filename = path.join(__dirname, '../routes/controllers/ProjectControllers.js');
    const controllers = {};
    vm.runInNewContext(fs.readFileSync(filename, 'utf8'), {
        exports: controllers,
        console: { log() {} },
        require(name) {
            if (name === '../../Database/DBConnection') return () => database;
            if (name === './AuditLog') return () => {};
            if (name === 'body-parser') return {};
            throw new Error('Unexpected module: ' + name);
        },
    }, { filename });

    return new Promise((resolve, reject) => {
        controllers.GetUserTimesForProject({ params: { id: projectID } }, {
            send(rows) { resolve(JSON.parse(JSON.stringify(rows))); },
            status(code) {
                return { json(body) { reject(new Error(`HTTP ${code}: ${body.message}`)); } };
            },
        });
    });
}

async function withDatabase(callback) {
    const database = new sqlite3.Database(':memory:');
    try {
        await new Promise((resolve, reject) => database.exec(`
            CREATE TABLE Users (
                userID INTEGER PRIMARY KEY, firstName TEXT NOT NULL, lastName TEXT NOT NULL
            );
            CREATE TABLE Projects (
                projectID INTEGER PRIMARY KEY, projectName TEXT NOT NULL, courseID INTEGER NOT NULL
            );
            CREATE TABLE Project_Users (userID INTEGER NOT NULL, projectID INTEGER NOT NULL);
            CREATE TABLE TimeCard (
                timeslotID INTEGER PRIMARY KEY, userID INTEGER NOT NULL, projectID INTEGER NOT NULL,
                timeIn TEXT NOT NULL, timeOut TEXT, description TEXT
            );
            INSERT INTO Users VALUES
                (101, 'Alex', 'Taylor'), (102, 'Alex', 'Taylor'),
                (103, 'Zero', 'Hours'), (104, 'Former', 'Member'), (105, 'Unrelated', 'Student');
            INSERT INTO Projects VALUES
                (10, 'Selected', 1), (11, 'Same course', 1), (20, 'Other course', 2), (30, 'Empty', 1);
            INSERT INTO Project_Users VALUES
                (101, 10), (101, 11), (101, 20), (102, 10),
                (103, 10), (103, 20), (104, 20), (105, 20);
        `, error => error ? reject(error) : resolve()));

        const timeIn = Date.UTC(2026, 0, 1, 10);
        const timecards = [
            [1, 101, 10, 1], [2, 101, 10, 1], [3, 101, 11, 0.5], [4, 101, 20, 8],
            [5, 102, 10, 2], [6, 102, 10, 3], [7, 102, 20, 4],
            [8, 104, 10, 1.5], [9, 103, 20, 9], [10, 104, 20, 6], [11, 105, 20, 7],
        ];
        for (const [timeslotID, userID, projectID, hours] of timecards) {
            await execute(database, 'INSERT INTO TimeCard VALUES (?, ?, ?, ?, ?, ?)',
                [timeslotID, userID, projectID, timeIn, timeIn + hours * 3600000, `Entry ${timeslotID}`]);
        }
        await execute(database, 'PRAGMA query_only = ON');
        await callback(database);
    } finally {
        await new Promise((resolve, reject) => {
            database.close(error => error ? reject(error) : resolve());
        });
    }
}

test('project history excludes entries from other projects in the same and different courses', async () => {
    await withDatabase(async database => {
        const rows = await getProjectReport(database, 10);
        const timecardIDs = rows.filter(row => row.timeslotID !== null).map(row => row.timeslotID);
        assert.deepEqual(timecardIDs.sort((a, b) => a - b), [1, 2, 5, 6, 8]);
        assert.equal(rows.some(row => row.userID === 105), false);

        const sameCourse = await getProjectReport(database, 11);
        assert.deepEqual(sameCourse.map(row => row.timeslotID), [3]);

        const otherCourse = await getProjectReport(database, 20);
        assert.deepEqual(otherCourse.map(row => row.timeslotID).sort((a, b) => a - b), [4, 7, 9, 10, 11]);
    });
});

test('same-named students keep separate IDs and accurate project contribution totals', async () => {
    await withDatabase(async database => {
        const rows = await getProjectReport(database, 10);
        const totals = new Map();
        for (const row of rows) {
            const duration = row.timeslotID === null ? 0 : row.timeOut - row.timeIn;
            totals.set(row.userID, (totals.get(row.userID) || 0) + duration);
        }
        assert.deepEqual([...totals].sort((a, b) => a[0] - b[0]), [
            [101, 2 * 3600000], [102, 5 * 3600000], [103, 0], [104, 1.5 * 3600000],
        ]);
        assert.equal([...totals.values()].reduce((sum, duration) => sum + duration, 0), 8.5 * 3600000);
    });
});

test('a current member with time only in another project still appears with no selected-project timecards', async () => {
    await withDatabase(async database => {
        const rows = await getProjectReport(database, 10);
        assert.deepEqual(rows.filter(row => row.userID === 103), [{
            userID: 103, firstName: 'Zero', lastName: 'Hours',
            timeIn: null, timeOut: null, timeslotID: null, description: null,
        }]);
    });
});

test('a former member retains historical time without including their other-project entries', async () => {
    await withDatabase(async database => {
        const rows = await getProjectReport(database, 10);
        const history = rows.filter(row => row.userID === 104);
        assert.equal(history.length, 1);
        assert.equal(history[0].timeslotID, 8);
        assert.equal(history[0].timeOut - history[0].timeIn, 1.5 * 3600000);
    });
});

test('an empty or nonexistent project returns no members or historical timecards', async () => {
    await withDatabase(async database => {
        assert.deepEqual(await getProjectReport(database, 30), []);
        assert.deepEqual(await getProjectReport(database, 999), []);
    });
});
