const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/main.db');

exports.GetAllCoursesNamesDescriptionIDs = (req, res) => {
	console.log("CourseControllers.js file/GetAllCoursesNamesDescriptionIDs route called");

	var rowData = "";

	let sql = `SELECT courseName, courseID, description
		FROM Courses`;

	db.all(sql, [], (err, rows) => {
		if (err) {
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}
		if (rows) {
			rowData += "[";
			rows.forEach((row) => {
				rowData += '{"courseName": "' + row.courseName + '", "courseID": "' + row.courseID + '", "description": "' + row.description + '"},';
			});
			rowData += "]";
			rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
			return res.send(rowData);
		}
	});
}

exports.GetAllCoursesForInstructorID = (req, res) => { // dynamic courses based on instructor id
	console.log("CourseControllers.js file/GetAllCoursesForInstructorID route called");

	var rowData = "";

	let sql = `SELECT courseName, courseID, description
		FROM Courses WHERE instructorID = ?`;

	db.all(sql, [req.params["id"]], (err, rows) => {
		if (err) {
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}
		if (rows) {
			rowData += "[";
			rows.forEach((row) => {
				rowData += '{"courseName": "' + row.courseName + '", "courseID": "' + row.courseID + '", "description": "' + row.description + '"},';
			});
			rowData += "]";
			rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
			return res.send(rowData);
		}
	});
}

exports.GetAllCourses = async (req, res) => {
	console.log("CourseControllers.js file/GetAllCourses route called");

	var rowData = "";

	let sql = `SELECT *
		FROM Courses`;

	db.all(sql, [], (err, rows) => {
		if (err) {
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}
		if (rows) {
			rowData += "[";
			rows.forEach((row) => {
				rowData += '{"courseName": "' + row.courseName + '", "courseID": "' + row.courseID + '", "description": "' + row.description + '"},';
			});
			rowData += "]";
			rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
			return res.send(rowData);
		}
	});
	// Something was inherently wrong with the below code, So I Braxton replaced it with what was done in all the other controllers.  You would get the following error text out from the the docker.
	/*
		express deprecated res.send(status, body): Use res.status(status).send(body) instead routes/controllers/CourseControllers.js:51:6
		node:internal/errors:478
			ErrorCaptureStackTrace(err);
			^
		
		RangeError [ERR_HTTP_INVALID_STATUS_CODE]: Invalid status code: CourseList
			at new NodeError (node:internal/errors:387:5)
			at ServerResponse.writeHead (node:_http_server:314:11)
			at ServerResponse._implicitHeader (node:_http_server:305:8)
			at write_ (node:_http_outgoing:867:9)
			at ServerResponse.end (node:_http_outgoing:977:5)
			at ServerResponse.send (/usr/src/app/node_modules/express/lib/response.js:232:10)
			at ServerResponse.json (/usr/src/app/node_modules/express/lib/response.js:278:15)
			at ServerResponse.send (/usr/src/app/node_modules/express/lib/response.js:162:21)
			at exports.GetAllCourses (/usr/src/app/routes/controllers/CourseControllers.js:51:6)
			at processTicksAndRejections (node:internal/process/task_queues:96:5) {
			code: 'ERR_HTTP_INVALID_STATUS_CODE'
		}
	*/
	// const courses = await db.all('SELECT * FROM Courses')
	// res.send('CourseList', { courses })
}
