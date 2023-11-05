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

exports.GetAllCoursesForInstructorID = (req, res) => { // dynamic courses based on instructor id
	console.log("CourseControllers.js file/GetAllCoursesForInstructorID route called");

	let instructorID = req.params["id"];
	let sql = `SELECT courseName, courseID, description
		FROM Courses
        WHERE instructorID = ?`;
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