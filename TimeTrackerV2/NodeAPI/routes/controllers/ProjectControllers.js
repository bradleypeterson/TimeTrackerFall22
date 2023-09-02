const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/main.db');

exports.GetAllProjectsForAllCourses = (req, res) => {
    console.log("/Projects called")
    var rowData = "";
    let sql = "SELECT p.projectName, p.projectID, p.description, c.courseName FROM Projects as p INNER JOIN Courses as c ON p.courseID = c.courseID";
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

// This function is currently has no known function because the Join Table, I am assuming, Project_Users is empty.
exports.CurrentlyUnknownFunction1 = (req, res) => {
    console.log("/Projects/:id/Users called")
    var rowData = "";
    let projectID = req.params["id"];
    console.log("projectID: " + projectID);
    let sql = `SELECT DISTINCT u.userID, u.firstName, u.lastName, t.timeIn, t.timeOut FROM Users as u INNER JOIN Project_Users as pu ON u.userID = pu.userID LEFT JOIN TimeCard as t ON u.userID = t.userID WHERE t.projectID = ${projectID}`;
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