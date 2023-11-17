const { json } = require('body-parser');
const ConnectToDB = require('../../database/DBConnection');

let db = ConnectToDB();

exports.GetProjectInfo = (req, res) => {
    console.log("ProjectControllers.js file/GetProjectInfo route called");

    let projectID = req.params["id"];
    console.log(`projectID: ${projectID}`);

    let sql = `SELECT projectName, isActive, courseID, description, projectID
    FROM Projects
    WHERE projectID = ?`;

    db.get(sql, [projectID], (err, rows) => {
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

exports.GetActiveProjectsForUser = (req, res) => {
    console.log("ProjectControllers.js file/GetActiveProjectsForUser route called");

    let userID = req.params["userID"];
    console.log(`userID: ${userID}`);

    let sql = `SELECT DISTINCT p.projectName, p.projectID, p.description, c.courseName, p.courseID, p.isActive
        FROM Projects as p
        INNER JOIN Courses as c ON c.courseID = p.courseID
        INNER JOIN Course_Users as cu ON cu.CourseID = c.courseID
        INNER JOIN Users as u on u.userID = ?
        INNER JOIN Project_Users as pu on pu.userID = u.userID AND pu.projectID = p.projectID
        WHERE p.isActive`;

    db.all(sql, [userID], (err, rows) => {
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

exports.GetUserTimesForProject = (req, res) => {
    console.log("ProjectControllers.js file/GetUserTimesForProject route called");

    let projectID = req.params["id"];
    console.log("projectID: " + projectID);

    let sql = `SELECT u.userID, u.firstName, u.lastName, tc.timeIn, tc.timeOut, tc.timeslotID
    -- Joins to get the students
    FROM Users u
    -- Joins to grab the timecards for the students
    LEFT OUTER JOIN Project_Users pu ON pu.userID = u.userID  -- Grab the connections to the projects the user is assigned to, but if they are not connected to any projects, return null.  A possible issue occurs here because this logic is copied from the "GetReportsData" route, read the issue there for the problem.
    LEFT OUTER JOIN Projects p ON p.projectID = pu.projectID  -- Grab all the projects the user has worked on, but if they have not part of the project, return null.
    LEFT OUTER JOIN TimeCard tc ON tc.userID = u.userID AND tc.projectID = p.projectID  -- Grab all the time cards that the user has made for the project, but if the user has not made any time cards, return null.
    -- Sort/Organize the data
    WHERE p.projectID = ?`;

    db.all(sql, [projectID], (err, rows) => {
        if (err) {
            console.log(JSON.stringify(err));
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            return res.send(rows);
        }
    });
}

// grab all projects based on provided courseID
exports.GetAllProjectsForCourse = (req, res) => {
    console.log("ProjectControllers.js file/GetAllProjectsForCourse route called");

    let courseID = req.params["id"];
    console.log(`courseID: ${courseID}`);

    let sql = `SELECT projectName, projectID, description, courseID, isActive
        FROM Projects
        WHERE courseID = ?`;

    db.all(sql, [courseID], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            return res.send(rows);
        }
    });
}

exports.GetUserProjectsForCourse = (req, res) => {
    console.log("ProjectControllers.js file/GetUserProjectsForCourse route called");

    let courseID = req.params["courseID"];
    let userID = req.params["userID"];

    let sql = `SELECT DISTINCT p.projectName, p.projectID, p.description, p.isActive
        FROM Projects p
        INNER JOIN Project_Users pu ON p.projectID = pu.projectID
        WHERE p.courseID = ? AND pu.userID = ?`;

    db.all(sql, [courseID, userID], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            return res.send(rows);
        }
    });
}

exports.GetNonUserProjectsForCourse = (req, res) => {
    console.log("ProjectControllers.js file/GetNonUserProjectsForCourse route called");

    courseID = req.params["courseID"];
    userID = req.params["userID"];

    let sql = `SELECT DISTINCT p.projectName, p.projectID, p.description, p.isActive
        FROM Projects p
        WHERE p.courseID = ? AND p.projectID not in (
            SELECT p.projectID
            FROM Projects p
            INNER JOIN Project_Users pu ON p.projectID = pu.projectID
            WHERE pu.userID = ?
            )`;

    db.all(sql, [courseID, userID], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            return res.send(rows);
        }
    });
}

exports.JoinGroup = async (req, res) => {
    console.log("ProjectControllers.js file/JoinGroup route called");

    let data = [];
    data[0] = req.body["userID"];
    data[1] = req.body["projectID"];

    db.run(`INSERT INTO Project_Users(userID, projectID)
        VALUES(?, ?)`, data, function (err) {
        if (err) {
            console.log(err)
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        else {
            return res.status(200).json({ message: 'User Project added.' });
        }
    });
}

exports.LeaveGroup = async (req, res) => {
    console.log("ProjectControllers.js file/LeaveGroup route called");

    let data = [];
    data[0] = req.body["projectID"];
    data[1] = req.body["userID"];

    let sql = `delete from Project_Users
        where projectID = ? and userID = ?;`;

    db.run(sql, data, function (err) {
        if (err) {
            console.log(err)
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        else {
            return res.status(200).json({ message: 'User Project deleted.' });
        }
    });
}

exports.GetAllStudentsInProject = (req, res) => {
	console.log("ProjectControllers.js file/GetAllStudentsInProject route called");

	let projectID = req.params["projectID"];

	let sql = `SELECT u.firstName, u.lastName, u.userID
		FROM Project_Users p
        INNER JOIN Users u ON p.userID = u.userID
        WHERE p.projectID = ?`;

	db.all(sql, [projectID], (err, rows) => {
		if (err) {
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}
		if (rows) {
			return res.send(rows);
		}
	});
}

exports.GetAllStudentsNotInProject = (req, res) => {
	console.log("ProjectControllers.js file/GetAllStudentsNotInProject route called");

	let projectID = req.params["projectID"];
    console.log("Project ID is: " + projectID);

	let sql = `SELECT DISTINCT u.firstName, u.lastName, u.userID
        FROM Projects p
        INNER JOIN Courses c ON p.courseID = c.courseID
        INNER JOIN Course_Users cu ON cu.courseID = c.courseID
        INNER JOIN Users u ON cu.userID = u.userID
        WHERE p.projectID = ? AND u.userID not in (
            SELECT userID
            FROM Project_Users
            WHERE projectID = ?
        )`;

	db.all(sql, [projectID, projectID], (err, rows) => {
		if (err) {
            console.log("Err reached");
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}
		if (rows) {
            console.log("Rows returned:" + JSON.stringify(rows));
			return res.send(rows);
		}
	});
}

exports.CreateProject = async (req, res, next) => {
    console.log("ProjectControllers.js file/CreateProject route called");

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
    console.log("ProjectControllers.js file/EditProject route called");

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
    console.log("ProjectControllers.js file/DeleteProject route called");

    let projectID = req.body["projectID"];

    let sql = `DELETE FROM Projects
            WHERE projectID = ?;`;

    db.run(sql, [projectID], function (err, value) {
        if (err) {
            console.log(err)
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        else {
            return res.status(200).json({ message: 'Project deleted.' });
        }
    });
}