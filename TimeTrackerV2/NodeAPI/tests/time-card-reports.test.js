const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

// Inject query results so these tests never open the application's databases.
function getReports(rows, error = null) {
    const filename = path.join(__dirname, '../routes/controllers/TimeCardControllers.js');
    const controllers = {};
    const response = {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        send(body) { this.body = JSON.parse(JSON.stringify(body)); },
        json(body) { this.send(body); },
    };

    vm.runInNewContext(fs.readFileSync(filename, 'utf8'), {
        exports: controllers,
        console: { log() {} },
        require(name) {
            if (name === '../../Database/DBConnection') {
                return () => ({ all(sql, params, callback) { callback(error, rows); } });
            }
            if (name === './AuditLog') return () => {};
            throw new Error('Unexpected module: ' + name);
        },
    }, { filename });

    controllers.GetReportsData({ params: { courseID: 2 } }, response);
    return response;
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
