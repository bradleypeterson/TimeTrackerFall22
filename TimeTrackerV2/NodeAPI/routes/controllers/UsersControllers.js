const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/main.db');

exports.GetFirstLastUserName = (req, res) => {
    console.log("UsersControllers.js file/GetFirstLastUserName route called");

    var rowData = "";

    let sql = `SELECT username, firstName, lastName
        FROM Users`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            rowData += "[";
            rows.forEach((row) => {
                rowData += '{"username": "' + row.username + '", "firstName": "' + row.firstName + '", "lastName": "' + row.lastName + '"},';
            });
            rowData += "]";
            rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
            return res.send(rowData);
        }
    });
}

//#region Student specific controllers
// Description of the SQL statement, this will select all courses that a STUDENT IS registered for.  If you supply a id of a instructor, the very last condition "AND cu.userID = $(userID}" will make it return nothing.
exports.GetCoursesRegisteredFor = (req, res) => {
    console.log("UsersControllers.js file/GetCoursesRegisteredFor route called");

    var rowData = "";
    let userId = req.params["userId"];

    let sql = `SELECT c.*, u.firstname, u.lastName
        from Courses c
        JOIN Course_Users cu ON cu.courseID = c.courseID
        JOIN Users u on u.userID = c.instructorID AND cu.userID = ${userId}`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            rowData += "[";
            rows.forEach((row) => {
                rowData += '{"courseID": "' + row.courseID + '", "courseName": "' + row.courseName + '", "instructorFN": "' + row.firstName + '", "instructorLN": "' + row.lastName + '", "description": "' + row.description + '"},';
            });
            rowData += "]";
            console.log("Data before slicing: " + rowData)
            rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
            console.log("Data after slicing: " + rowData)
            return res.send(rowData);
        }
    });
}

// Description of the SQL statement, this will select all courses that a STUDENT IS NOT registered for.
exports.GetCoursesNotRegisteredFor = (req, res) => {
    console.log("UsersControllers.js file/GetCoursesNotRegisteredFor route called");

    var rowData = "";
    let userId = req.params["userId"];

    let sql = `select c.*, u.firstname, u.lastname
        from Courses c
        JOIN Users u where u.userID = c.instructorID AND c.courseID not in (
            select c.courseID
            from Courses c
            join Course_Users cu ON cu.courseID = c.courseID AND cu.userID = ${userId}
        )`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            rowData += "[";
            rows.forEach((row) => {
                rowData += '{"courseID": "' + row.courseID + '", "courseName": "' + row.courseName + '", "instructorFN": "' + row.firstName + '", "instructorLN": "' + row.lastName + '", "description": "' + row.description + '"},';
            });
            rowData += "]";
            rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
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
//#endregion
