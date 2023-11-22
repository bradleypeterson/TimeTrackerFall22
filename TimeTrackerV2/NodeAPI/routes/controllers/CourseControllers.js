const ConnectToDB = require('../../database/DBConnection');

let db = ConnectToDB();

exports.GetAllCoursesNamesDescriptionIDs = (req, res) => {
	console.log("CourseControllers.js file/GetAllCoursesNamesDescriptionIDs route called");

	let sql = `SELECT courseName, courseID, description
		FROM Courses`;

	db.all(sql, [], (err, rows) => {
		if (err) {
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}
		if (rows) {
			return res.send(rows);
		}
	});
}

exports.CheckUserInCourse = (req, res) => {
	console.log("CourseControllers.js file/CheckUserInCourse route called");

	let courseID = req.params["courseID"];
	let userID = req.params["userID"];

	let sql = `SELECT userID
		FROM Course_Users WHERE courseID = ? AND userID = ?`;

	db.all(sql, [courseID, userID], (err, rows) => {
		if (err) {
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}
		if (rows) {
			return res.send(rows);
		}
	});
}

exports.GetCourseInfo = (req, res) => {
    console.log("CourseControllers.js file/GetCourseInfo route called");

    let courseID = req.params["id"];

    let sql = `SELECT courseName, isActive, courseID, description, instructorID
    FROM Courses
    WHERE courseID = ?`;

    db.get(sql, [courseID], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            console.log(`Rows retrieved:  ${JSON.stringify(rows)}`);
            return res.send(rows);
        }
        else {
            return res.send("No errors occurred, however no rows were found either.");
        }
    });
}

//#region Instructor specific controllers
exports.GetAllCoursesForInstructorID = (req, res) => { // dynamic courses based on instructor id
	console.log("CourseControllers.js file/GetAllCoursesForInstructorID route called");

	let instructorID = req.params["id"];
	let sql = `SELECT courseName, courseID, description
		FROM Courses
        WHERE instructorID = ? AND isActive`;
	console.log("instructorID: " + instructorID);

	db.all(sql, [instructorID], (err, rows) => {
		if (err) {
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}
		if (rows) {
			return res.send(rows);
		}
	});
}

exports.GetInactiveCoursesForInstructorID = (req, res) => { // dynamic courses based on instructor id
	console.log("CourseControllers.js file/GetInactiveCoursesForInstructorID route called");

	let instructorID = req.params["id"];
	let sql = `SELECT courseName, courseID, description
		FROM Courses
        WHERE instructorID = ? AND isActive IS FALSE`;

	db.all(sql, [instructorID], (err, rows) => {
		if (err) {
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}
		if (rows) {
			return res.send(rows);
		}
	});
}

exports.CreateCourse = async (req, res, next) => {
    console.log("CourseControllers.js file/CreateCourse route called");

    let data = [];
    data[0] = req.body["courseName"];
    data[1] = req.body["isActive"];
    data[2] = req.body["instructorID"];
    data[3] = req.body["description"];

    db.run(`INSERT INTO Courses(courseName, isActive, instructorID, description)
        VALUES(?, ?, ?, ?)`, data, function (err, rows) {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        } else {
            return res.status(200).json({ course: data });
        }
    });
}

exports.EditCourse = async (req, res, next) => {
    console.log("CourseControllers.js file/EditCourse route called");

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
    console.log("CourseControllers.js file/DeleteCourse route called");

    let courseID = req.body["courseID"];

    let sql = `DELETE FROM Courses
    WHERE courseID = ?;`;

    db.run(sql, [courseID], function (err, value) {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        else {
            return res.status(200).json({ message: 'Course deleted.' });
        }
    });
}

exports.GetPendInstrCourses = (req, res) => {
    console.log("CourseControllers.js file/getPendInstrCourses route called");

    let userID = req.params["userId"];
    console.log("userID: " + userID)

    let sql = `
        SELECT 
            c.courseID,
            c.courseName,
            pcu.userID AS studentID,
            user.firstName AS studentFirstName,
            user.lastName AS studentLastName
        FROM Courses c
        JOIN Pend_Course_Users pcu ON pcu.courseID = c.courseID
        JOIN Users instr ON instr.userID = c.instructorID
        JOIN Users user ON user.userID = pcu.userID
        WHERE instr.userID = ? AND c.isActive`;

    db.all(sql, [userID], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        return res.send(rows);
    });
}

// exports.GetPendInstrCourses = (req, res) => {
//     // Log a message to the console indicating that this particular route handler (controller action) has been called.
//     console.log("CourseControllers.js file/getPendInstrCourses route called");

//     var rowData = [];
//     let userID = req.params["userId"];
//     console.log("userID: " + userID)

//     let sql = `
//         SELECT
//             c.courseID,
//             c.courseName,
//             c.description,
//             instr.firstname AS instructorFirstName,
//             instr.lastName AS instructorLastName,
//             user.firstName AS userFirstName,
//             user.lastName AS userLastName
//         FROM Courses c
//         JOIN Pend_Course_Users pcu ON pcu.courseID = c.courseID
//         JOIN Users instr ON instr.userID = c.instructorID
//         JOIN Users user ON user.userID = pcu.userID
//         WHERE instr.userID = ?`;


//     db.all(sql, [userID], (err, rows) => {
//         if (err) {
//             return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
//         }
//         if (rows) {
//             rows.forEach((row) => {

//                 rowData.push({
//                     courseID: row.courseID,
//                     courseName: row.courseName,
//                     userFirstName: row.userFirstName,
//                     userLastName: row.userLastName,
//                     description: row.description
//                 });
//             });

//             return res.send(rowData);
//         }
//     });
// }
//#endregion

//#region Student specific controllers
// Description of the SQL statement, this will select all courses that a STUDENT IS registered for.  If you supply a id of a instructor, the very last condition "AND cu.userID = $(userID}" will make it return nothing.
exports.GetCoursesRegisteredFor = (req, res) => {
    console.log("CourseControllers.js file/GetCoursesRegisteredFor route called");

    var rowData = [];
    let userID = req.params["userId"];
    console.log("userID: " + userID)

    let sql = `SELECT c.courseID, c.courseName, c.description, u.firstname, u.lastName
        from Courses c
        JOIN Course_Users cu ON cu.courseID = c.courseID
        JOIN Users u on u.userID = c.instructorID AND cu.userID = ?
        WHERE c.isActive`;

    db.all(sql, [userID], (err, rows) => {
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
    // Log a message to the console indicating that this particular route handler (controller action) has been called.
    console.log("CourseControllers.js file/GetCoursesNotRegisteredFor route called");

    var rowData = [];

    let userID = req.params["userId"];
    console.log("userID: " + userID)

    let sql = `SELECT c.courseID, c.courseName, c.description, u.firstName, u.lastName
        FROM Courses c
        JOIN Users u ON u.userID = c.instructorID 
        WHERE c.isActive AND c.courseID NOT IN (
            -- Subquery to get courses the user is already registered for
            SELECT c.courseID
            FROM Courses c
            JOIN Course_Users cu ON cu.courseID = c.courseID AND cu.userID = ?
            UNION
            -- Subquery to get courses the user has pending registrations for
            SELECT pcu.courseID
            FROM Pend_Course_Users pcu 
            WHERE pcu.userID = ?
        )`;

    db.all(sql, [userID, userID], (err, rows) => {
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
}// This code embeds userID directly into the SQL, which is potentially dangerous.

exports.GetCoursesPendCourses = (req, res) => {
    // Log a message to the console indicating that this particular route handler (controller action) has been called.
    console.log("CourseControllers.js file/GetCoursesPendCourses route called");

    var rowData = [];
    let userID = req.params["userId"];
    console.log("userID: " + userID)

    let sql = `SELECT c.courseID, c.courseName, c.description, u.firstname, u.lastName
        from Courses c
        JOIN Pend_Course_Users pcu ON pcu.courseID = c.courseID
        JOIN Users u on u.userID = c.instructorID AND pcu.userID = ?
        WHERE c.isActive`;

    db.all(sql, [userID], (err, rows) => {
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

exports.PutUserInPending = async (req, res, next) => {
    console.log("CourseControllers.js file/PutUserInPending route called");

    let data = [];
    data[0] = req.body["userID"];
    data[1] = req.body["courseID"];

    db.run(`INSERT INTO Pend_Course_Users(userID, courseID)
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

exports.RegisterForCourse = async (req, res, next) => {
    console.log("CourseControllers.js file/RegisterForCourse route called");

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
    console.log("CourseControllers.js file/DropCourse route called");

    let data = [];
    data[0] = req.body["courseID"];
    data[1] = req.body["userID"];

    let sql = `delete from Course_Users
        where courseID = ? and userID = ?;`;

    db.run(sql, data, function (err, value) {
        if (err) {
            console.log(err)
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        else {
            return res.status(200).json({ message: 'User Course deleted.' });
        }
    });
}

exports.RemovePendUser = async (req, res, next) => {
    console.log("CourseControllers.js file/removePendUser route called");

    let data = [];
    data[0] = req.body["courseID"];
    data[1] = req.body["userID"];

    let sql = `delete from Pend_Course_Users
        where courseID = ? and userID = ?;`;

    db.run(sql, data, function (err, value) {
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