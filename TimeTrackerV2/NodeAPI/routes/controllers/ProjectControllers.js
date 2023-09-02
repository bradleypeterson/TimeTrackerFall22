const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/main.db');

exports.GetAllProjectsForAllCourses = (req, res) => {
    console.log("/Projects called")
    var rowData = "";
    let sql = `SELECT p.projectName, p.projectID, p.description, c.courseName
        FROM Projects as p
        INNER JOIN Courses as c ON p.courseID = c.courseID`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            rowData += "[";
            rows.forEach((row) => {
                rowData += '{"projectName": "' + row.projectName + '", "projectID": ' + row.projectID + ', "description": "' + row.description + '", "courseName": "' + row.courseName + '"},';
            });
            rowData += "]";
            rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
            console.log(rowData);
            return res.send(rowData);
        }
    });
}

// This function is currently can't be implemented because the Join Table "Project_Users" is never inserted into.  But from what I can see with the SQL, it is going to select unique users and their timeIn and TimeOut using the desired projectID.
exports.GetUserTimesForProject = (req, res) => {
    console.log("/Projects/:id/Users called")
    var rowData = "";
    let projectID = req.params["id"];
    console.log("projectID: " + projectID);
    let sql = `SELECT DISTINCT u.userID, u.firstName, u.lastName, t.timeIn, t.timeOut
        FROM Users as u
        INNER JOIN Project_Users as pu ON u.userID = pu.userID
        LEFT JOIN TimeCard as t ON u.userID = t.userID
        WHERE t.projectID = ${projectID}`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            rowData += "[";
            rows.forEach((row) => {
                console.log("userID: " + row.userID + ", firstName: " + row.firstName + ", lastName: " + row.lastName + ", timeIn: " + row.timeIn + ", timeOut: " + row.timeOut);
                rowData += '{"userID": "' + row.userID + '", "firstName": "' + row.firstName + '", "lastName": "' + row.lastName + '", "timeIn": ' + row.timeIn + ', "timeOut": ' + row.timeOut + '},';
            });
            rowData += "]";
            console.log("rowData before slice " + rowData);
            rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
            console.log("rowData after slice " + rowData);
            return res.send(rowData);
        }
    });
}

exports.GetAllProjectsForCourse = (req, res) => { // grab all projects based on provided courseid
    console.log("/Projects/:id called")
    var rowData = "";
    let courseID = req.params["id"];
    let sql = `SELECT projectName, projectID, description
        FROM Projects WHERE courseID = ?`;
    db.all(sql, [req.params["id"]], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            rowData += "[";
            rows.forEach((row) => {
                rowData += '{"projectName": "' + row.projectName + '", "projectID": "' + row.projectID + '", "description": "' + row.description + '"},';
            });
            rowData += "]";
            rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
            return res.send(rowData);
        }
    });
}
