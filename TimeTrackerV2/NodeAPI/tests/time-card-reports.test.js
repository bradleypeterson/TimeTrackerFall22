const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const sqlite3 = require('sqlite3');

// Inject a stub or in-memory database; never open the application's databases.
function runReports(database, courseID, onSend = () => {}) {
    const filename = path.join(__dirname, '../routes/controllers/TimeCardControllers.js');
    const controllers = {};
    const response = {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        send(body) {
            this.body = JSON.parse(JSON.stringify(body));
            onSend(this);
        },
        json(body) { this.send(body); },
    };

    vm.runInNewContext(fs.readFileSync(filename, 'utf8'), {
        exports: controllers,
        console: { log() {} },
        require(name) {
            if (name === '../../Database/DBConnection') {
                return () => database;
            }
            if (name === './AuditLog') return () => {};
            throw new Error('Unexpected module: ' + name);
        },
    }, { filename });

    controllers.GetReportsData({ params: { courseID } }, response);
    return response;
}

function getReports(rows, error = null) {
    return runReports({ all(sql, params, callback) { callback(error, rows); } }, 2);
}

function execute(database, sql, params = []) {
    return new Promise((resolve, reject) => {
        database.run(sql, params, error => error ? reject(error) : resolve());
    });
}

function readRows(database, sql) {
    return new Promise((resolve, reject) => {
        database.all(sql, [], (error, rows) => error ? reject(error) : resolve(rows));
    });
}

async function getDatabaseReports(database, courseID = 1) {
    // Reporting must work with writes disabled, including for historical data.
    await execute(database, 'PRAGMA query_only = ON');
    return new Promise(resolve => runReports(database, courseID, resolve));
}

async function withDatabase(callback) {
    const database = new sqlite3.Database(':memory:');
    try {
        await new Promise((resolve, reject) => database.exec(`
            CREATE TABLE Users (
                userID INTEGER PRIMARY KEY, firstName TEXT NOT NULL, lastName TEXT NOT NULL
            );
            CREATE TABLE Courses (courseID INTEGER PRIMARY KEY);
            CREATE TABLE Course_Users (userID INTEGER NOT NULL, courseID INTEGER NOT NULL);
            CREATE TABLE Projects (
                projectID INTEGER PRIMARY KEY, projectName TEXT NOT NULL, courseID INTEGER NOT NULL
            );
            CREATE TABLE Project_Users (userID INTEGER NOT NULL, projectID INTEGER NOT NULL);
            CREATE TABLE TimeCard (
                timeslotID INTEGER PRIMARY KEY, userID INTEGER NOT NULL,
                projectID INTEGER NOT NULL, timeIn TEXT NOT NULL, timeOut TEXT
            );
            INSERT INTO Users VALUES (101, 'Alex', 'Taylor'), (102, 'Alex', 'Taylor');
            INSERT INTO Courses VALUES (1), (2);
            INSERT INTO Course_Users VALUES (101, 1), (102, 1);
            INSERT INTO Projects VALUES
                (10, 'First', 1), (11, 'Second', 1), (20, 'Unrelated', 2);
        `, error => error ? reject(error) : resolve()));
        await callback(database);
    } finally {
        await new Promise((resolve, reject) => {
            database.close(error => error ? reject(error) : resolve());
        });
    }
}

async function addTimecard(database, userID, projectID, hours) {
    const timeIn = Date.UTC(2026, 0, 1, 10);
    await execute(database,
        'INSERT INTO TimeCard (userID, projectID, timeIn, timeOut) VALUES (?, ?, ?, ?)',
        [userID, projectID, timeIn, timeIn + hours * 3600000]);
}

async function membershipAndTimecardSnapshot(database) {
    const [courseMemberships, projectMemberships, timecards] = await Promise.all([
        readRows(database, 'SELECT * FROM Course_Users ORDER BY userID, courseID'),
        readRows(database, 'SELECT * FROM Project_Users ORDER BY userID, projectID'),
        readRows(database, 'SELECT * FROM TimeCard ORDER BY timeslotID'),
    ]);
    return { courseMemberships, projectMemberships, timecards };
}

test('an empty roster returns HTTP 200 with []', () => {
    const response = getReports([]);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, []);
});

test('nonempty reports keep student grouping, projects, and recorded totals', () => {
    const response = getReports([
        { userID: 3, studentName: 'Student A', projectID: 10, projectName: 'First', totalTime: 3600000 },
        { userID: 3, studentName: 'Student A', projectID: 11, projectName: 'Second', totalTime: 60000 },
        { userID: 4, studentName: 'Student B', projectID: 10, projectName: 'First', totalTime: 120000 },
    ]);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, [
        { userID: 3, studentName: 'Student A', projects: [
            { projectID: 10, projectName: 'First', totalTime: 3600000 },
            { projectID: 11, projectName: 'Second', totalTime: 60000 },
        ] },
        { userID: 4, studentName: 'Student B', projects: [
            { projectID: 10, projectName: 'First', totalTime: 120000 },
        ] },
    ]);
});

test('a student without projects retains the existing null project fields', () => {
    const response = getReports([
        { userID: 3, studentName: 'Student A', projectID: null, projectName: null, totalTime: null },
    ]);
    assert.deepEqual(response.body, [
        { userID: 3, studentName: 'Student A', projects: [
            { projectID: null, projectName: null, totalTime: null },
        ] },
    ]);
});

test('query errors retain the existing HTTP 500 response', () => {
    const response = getReports(undefined, new Error('Test query failure'));
    assert.equal(response.statusCode, 500);
    assert.deepEqual(response.body, { message: 'Something went wrong. Please try again later.' });
});

test('interleaved rows for identical names produce exactly two reports keyed by user ID', () => {
    const rows = [
        { userID: 101, studentName: 'Alex Taylor', projectID: 10, projectName: 'First', totalTime: 7200000 },
        { userID: 102, studentName: 'Alex Taylor', projectID: 10, projectName: 'First', totalTime: 18000000 },
        { userID: 101, studentName: 'Alex Taylor', projectID: 11, projectName: 'Second', totalTime: 60000 },
        { userID: 102, studentName: 'Alex Taylor', projectID: 11, projectName: 'Second', totalTime: null },
    ];

    for (const input of [rows, [...rows].reverse()]) {
        const response = getReports(input);
        assert.equal(response.statusCode, 200);
        assert.equal(response.body.length, 2);
        for (const userID of [101, 102]) {
            const reports = response.body.filter(report => report.userID === userID);
            assert.equal(reports.length, 1);
            assert.equal(reports[0].studentName, 'Alex Taylor');
            assert.deepEqual(reports[0].projects,
                input.filter(row => row.userID === userID).map(row => ({
                    projectID: row.projectID, projectName: row.projectName, totalTime: row.totalTime,
                })));
        }
    }
});

test('SQLite reports sum multiple timecards separately for same-named students and each project', async () => {
    await withDatabase(async database => {
        await execute(database, `INSERT INTO Project_Users VALUES
            (101, 10), (101, 11), (102, 10), (102, 11)`);
        await addTimecard(database, 101, 10, 1);
        await addTimecard(database, 101, 10, 1);
        await addTimecard(database, 101, 11, 0.5);
        await addTimecard(database, 102, 10, 2);
        await addTimecard(database, 102, 10, 3);

        const response = await getDatabaseReports(database);
        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, [
            { userID: 101, studentName: 'Alex Taylor', projects: [
                { projectID: 10, projectName: 'First', totalTime: 7200000 },
                { projectID: 11, projectName: 'Second', totalTime: 1800000 },
            ] },
            { userID: 102, studentName: 'Alex Taylor', projects: [
                { projectID: 10, projectName: 'First', totalTime: 18000000 },
                { projectID: 11, projectName: 'Second', totalTime: null },
            ] },
        ]);
    });
});

test('course filtering excludes unrelated projects and their time from both courses reports', async () => {
    await withDatabase(async database => {
        await execute(database, 'INSERT INTO Course_Users VALUES (101, 2), (102, 2)');
        await execute(database, 'INSERT INTO Project_Users VALUES (101, 10), (101, 20), (102, 20)');
        await addTimecard(database, 101, 10, 2);
        await addTimecard(database, 101, 20, 8);
        await addTimecard(database, 102, 20, 9);

        const firstCourse = await getDatabaseReports(database, 1);
        assert.equal(firstCourse.statusCode, 200);
        assert.deepEqual([...firstCourse.body].sort((a, b) => a.userID - b.userID), [
            { userID: 101, studentName: 'Alex Taylor', projects: [
                { projectID: 10, projectName: 'First', totalTime: 7200000 },
            ] },
            { userID: 102, studentName: 'Alex Taylor', projects: [
                { projectID: null, projectName: null, totalTime: null },
            ] },
        ]);

        const secondCourse = await getDatabaseReports(database, 2);
        assert.equal(secondCourse.statusCode, 200);
        assert.deepEqual(secondCourse.body, [
            { userID: 101, studentName: 'Alex Taylor', projects: [
                { projectID: 20, projectName: 'Unrelated', totalTime: 28800000 },
            ] },
            { userID: 102, studentName: 'Alex Taylor', projects: [
                { projectID: 20, projectName: 'Unrelated', totalTime: 32400000 },
            ] },
        ]);
    });
});

test('enrolled students retain historical project totals without restoring project memberships', async () => {
    await withDatabase(async database => {
        await execute(database, 'INSERT INTO Project_Users VALUES (101, 11)');
        await addTimecard(database, 101, 10, 1);
        await addTimecard(database, 101, 10, 1);
        const before = await membershipAndTimecardSnapshot(database);

        const response = await getDatabaseReports(database);
        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body.find(report => report.userID === 101), {
            userID: 101, studentName: 'Alex Taylor', projects: [
                { projectID: 10, projectName: 'First', totalTime: 7200000 },
                { projectID: 11, projectName: 'Second', totalTime: null },
            ],
        });
        assert.deepEqual(before.projectMemberships, [{ userID: 101, projectID: 11 }]);
        assert.deepEqual(await membershipAndTimecardSnapshot(database), before);
    });
});

test('removed course students stay out of the roster while their historical timecards remain intact', async () => {
    await withDatabase(async database => {
        // State after dropping or being removed: the course's memberships are gone,
        // while historical timecards and memberships in another course remain.
        await execute(database, 'DELETE FROM Course_Users WHERE userID = 101 AND courseID = 1');
        await execute(database, 'INSERT INTO Course_Users VALUES (101, 2)');
        await execute(database, 'INSERT INTO Project_Users VALUES (101, 20), (102, 10)');
        await addTimecard(database, 101, 10, 2);
        await addTimecard(database, 101, 20, 8);
        await addTimecard(database, 102, 10, 5);
        const before = await membershipAndTimecardSnapshot(database);

        const firstCourse = await getDatabaseReports(database, 1);
        assert.equal(firstCourse.statusCode, 200);
        assert.deepEqual(firstCourse.body, [
            { userID: 102, studentName: 'Alex Taylor', projects: [
                { projectID: 10, projectName: 'First', totalTime: 18000000 },
            ] },
        ]);

        const secondCourse = await getDatabaseReports(database, 2);
        assert.deepEqual(secondCourse.body, [
            { userID: 101, studentName: 'Alex Taylor', projects: [
                { projectID: 20, projectName: 'Unrelated', totalTime: 28800000 },
            ] },
        ]);
        assert.deepEqual(before.projectMemberships, [
            { userID: 101, projectID: 20 }, { userID: 102, projectID: 10 },
        ]);
        assert.equal(before.timecards.length, 3);
        assert.deepEqual(await membershipAndTimecardSnapshot(database), before);
    });
});

test('an empty current roster stays empty even when removed students have historical timecards', async () => {
    await withDatabase(async database => {
        await execute(database, 'DELETE FROM Course_Users WHERE courseID = 1');
        await addTimecard(database, 101, 10, 2);
        const before = await membershipAndTimecardSnapshot(database);

        const response = await getDatabaseReports(database);
        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, []);
        assert.equal(before.timecards.length, 1);
        assert.deepEqual(await membershipAndTimecardSnapshot(database), before);
    });
});

test('SQLite preserves null totals for project members and null project fields for unassigned students', async () => {
    await withDatabase(async database => {
        await execute(database, 'INSERT INTO Project_Users VALUES (101, 10)');

        const response = await getDatabaseReports(database);
        assert.equal(response.statusCode, 200);
        assert.deepEqual([...response.body].sort((a, b) => a.userID - b.userID), [
            { userID: 101, studentName: 'Alex Taylor', projects: [
                { projectID: 10, projectName: 'First', totalTime: null },
            ] },
            { userID: 102, studentName: 'Alex Taylor', projects: [
                { projectID: null, projectName: null, totalTime: null },
            ] },
        ]);
    });
});

test('same-named projects remain separate by project ID', async () => {
    await withDatabase(async database => {
        await execute(database, 'INSERT INTO Projects VALUES (12, ?, 1)', ['First']);
        await execute(database, 'INSERT INTO Project_Users VALUES (101, 10), (101, 12)');
        await addTimecard(database, 101, 10, 2);
        await addTimecard(database, 101, 12, 3);

        const response = await getDatabaseReports(database);
        assert.equal(response.statusCode, 200);
        const projects = response.body.find(report => report.userID === 101).projects;
        assert.deepEqual([...projects].sort((a, b) => a.projectID - b.projectID), [
            { projectID: 10, projectName: 'First', totalTime: 7200000 },
            { projectID: 12, projectName: 'First', totalTime: 10800000 },
        ]);
    });
});
