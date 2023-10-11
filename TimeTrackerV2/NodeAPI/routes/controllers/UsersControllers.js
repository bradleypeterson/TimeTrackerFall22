const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/main.db');

exports.GetAllFirstLastUserNames = (req, res) => {
    console.log("UsersControllers.js file/GetFirstLastUserName route called");

    let sql = `SELECT username, firstName, lastName
        FROM Users`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            return res.send(rows);
        }
    });
}

//#region Student specific controllers
// Description of the SQL statement, this will select all courses that a STUDENT IS registered for.  If you supply a id of a instructor, the very last condition "AND cu.userID = $(userID}" will make it return nothing.
exports.GetCoursesRegisteredFor = (req, res) => {
    console.log("UsersControllers.js file/GetCoursesRegisteredFor route called");

    var rowData = [];
    let userID = req.params["userId"];
    console.log("userID: " + userID)

    let sql = `SELECT c.courseID, c.courseName, c.description, u.firstname, u.lastName
        from Courses c
        JOIN Course_Users cu ON cu.courseID = c.courseID
        JOIN Users u on u.userID = c.instructorID AND cu.userID = ${userID}`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            rows.forEach((row) => {
                rowData.push({
                    courseID: row.courseID,
                    courseName: row.courseName,
                    instructorFN: row.firstName,
                    instructorLN: row.lastName,
                    description: row.description
                });
            });

            return res.send(rowData);
        }
    });
}

// Description of the SQL statement, this will select all courses that a STUDENT IS NOT registered for.
exports.GetCoursesNotRegisteredFor = (req, res) => {
    console.log("UsersControllers.js file/GetCoursesNotRegisteredFor route called");

    var rowData = [];
    let userID = req.params["userId"];
    console.log("userID: " + userID)

    let sql = `select c.courseID, c.courseName, c.description, u.firstname, u.lastname
        from Courses c
        JOIN Users u where u.userID = c.instructorID AND c.courseID not in (
            select c.courseID
            from Courses c
            join Course_Users cu ON cu.courseID = c.courseID AND cu.userID = ${userID}
        )`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            rows.forEach((row) => {
                rowData.push({
                    courseID: row.courseID,
                    courseName: row.courseName,
                    instructorFN: row.firstName,
                    instructorLN: row.lastName,
                    description: row.description
                });
            });

            return res.send(rowData);
        }
    });
}

exports.RegisterForCourse = async (req, res, next) => {
    console.log("UsersControllers.js file/RegisterForCourse route called");

    let data = [];
    data[0] = req.body["userID"];
    data[1] = req.body["courseID"];

    db.run(`INSERT INTO Course_Users(userID, courseID)
        VALUES(?, ?)`, data, function (err, value) {
        if (err) {
            console.log(err)
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        else {
            return res.status(200).json({ message: 'User Course added.' });
        }
    });
}

exports.DropCourse = async (req, res, next) => {
    console.log("UsersControllers.js file/DropCourse route called");

    let data = [];
    data[0] = req.body["userID"];
    data[1] = req.body["courseID"];

    let sql = `delete from Course_Users
        where courseID = ${data[1]} and userID = ${data[0]};`;

    db.run(sql, function (err, value) {
        if (err) {
            console.log(err)
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        else {
            return res.status(200).json({ message: 'User Course deleted.' });
        }
    });
}
//#endregion

//#region Instructor specific controllers
exports.CreateCourse = async (req, res, next) => {
    console.log("UsersControllers.js file/CreateCourse route called");

    let data = [];
    data[0] = req.body["courseName"];
    data[1] = req.body["isActive"];
    data[2] = req.body["instructorID"];
    data[3] = req.body["description"];

    db.run(`INSERT INTO Courses(courseName, isActive, instructorID, description)
        VALUES(?, ?, ?, ?)`, data, function (err, rows) {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        } else {
            return res.status(200).json({ course: data });
        }
    });
}

exports.EditCourse = async (req, res, next) => {
    console.log("UsersControllers.js file/EditCourse route called");

    let data = [];
    data[0] = req.body["courseName"];
    data[1] = req.body["isActive"];
    data[2] = req.body["instructorID"];
    data[3] = req.body["description"];
    data[4] = req.body["courseID"];

    sql = `UPDATE Courses
    SET courseName = ?, isActive = ?, instructorID = ?, description = ?
    WHERE courseID = ?`;

    db.run(sql, data, function (err, rows) {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        } else {
            return res.status(200).json({ course: data });
        }
    });
}

exports.DeleteCourse = async (req, res, next) => {
    console.log("UsersControllers.js file/DeleteCourse route called");

    db.get("PRAGMA foreign_keys = ON");

    let courseID = req.body["courseID"];

    let sql = `delete from Courses
    where courseID = ${courseID};`;

    db.run(sql, function (err, value) {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        else {
            return res.status(200).json({ message: 'Course deleted.' });
        }
    });
}

exports.CreateProject = async (req, res, next) => {
    console.log("UsersControllers.js file/CreateProject route called");

    let data = [];
    data[0] = req.body["projectName"];
    data[1] = req.body["isActive"];
    data[2] = req.body["courseID"];
    data[3] = req.body["description"];

    db.run(`INSERT INTO Projects(projectName, isActive, courseID, description)
        VALUES(?, ?, ?, ?)`, data, function (err, rows) {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        } else {
            return res.status(200).json({ project: data });
        }
    });
}

exports.EditProject = async (req, res, next) => {
    console.log("UsersControllers.js file/EditProject route called");

    let data = [];
    data[0] = req.body["projectName"];
    data[1] = req.body["isActive"];
    data[2] = req.body["description"];
    data[3] = req.body["projectID"];

    sql = `UPDATE Projects
    SET projectName = ?, isActive = ?, description = ?
    WHERE projectID = ?`;

    db.run(sql, data, function (err, rows) {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        } else {
            return res.status(200).json({ project: data });
        }
    });
}

exports.DeleteProject = async (req, res, next) => {
    console.log("UsersControllers.js file/DeleteProject route called");

    db.get("PRAGMA foreign_keys = ON");

    let projectID = req.body["projectID"];

    let sql = `delete from Projects
            where projectID = ${projectID};`;

    db.run(sql, function (err, value) {
        if (err) {
            console.log(err)
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        else {
            return res.status(200).json({ message: 'Project deleted.' });
        }
    });
}
//#endregion
