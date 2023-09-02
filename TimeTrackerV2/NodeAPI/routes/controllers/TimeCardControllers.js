const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/main.db');

exports.GetAllTimeCardsForUserInProject = (req, res) => {
	console.log("/Users/:userId/:projectID/activities called")
	var rowData = "";
	let userId = req.params["userId"];
	let projectID = req.params["projectID"];
	let sql = `SELECT timeIn, timeOut, description
    	FROM TimeCard
    	WHERE userID = ${userId} AND projectID = ${projectID}`;
	db.all(sql, [], (err, rows) => {
		if (err) {
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}
		if (rows) {
			rowData += "[";
			rows.forEach((row) => {
				rowData += '{"timeIn": "' + row.timeIn + '", "timeOut": "' + row.timeOut + '", "description": "' + row.description + '"},';
			});
			rowData += "]";
			rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
			return res.send(rowData);
		}
	});
}

exports.GetAllTimeCardsForUser = (req, res) => {
	console.log("/Users/:userId/activities called")
	var rowData = "";
	let userId = req.params["userId"];
	let sql = `SELECT timeIn, timeOut, description
		FROM TimeCard WHERE userID = ${userId}`;
	db.all(sql, [], (err, rows) => {
		if (err) {
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}
		if (rows) {
			rowData += "[";
			rows.forEach((row) => {
				rowData += '{"timeIn": "' + row.timeIn + '", "timeOut": "' + row.timeOut + '", "description": "' + row.description + '"},';
			});
			rowData += "]";
			rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
			return res.send(rowData);
		}
	});
}

exports.ClockOperation = async (req, res, next) => {
	console.log("/clock called")
	/*function isEmpty(str) {
	  return (!str || str.length === 0 );
	}
    
	let isValid = true;
	let isClockin = req.body["timeIn"] !== null;
	let sql = `SELECT * FROM TimeCard WHERE UserID = ?`;
	db.all(sql, [req.body["userID"]], (error, rows) => 
	{
	  if (error) {
		return res.status(500).json({message: 'Something went wrong. Please try again later.'});
	  }
  
	  if(isClockin){
		console.log("clocking in.");
		rows.forEach(row => {
		  isValid = (row['timeOut'] !== null);
		});
  
		if(!isValid){
		  return res.status(400).json({message: 'you have an outstanding clock in. Please clock out.'});
		}*/

	let data = [];

	data[0] = req.body["timeIn"];
	data[1] = req.body["timeOut"];
	data[2] = req.body["isEdited"];
	data[3] = req.body["userID"];
	data[4] = req.body["description"];
	data[5] = req.body["projectID"];

	db.run(`INSERT INTO TimeCard(timeIn, timeOut, isEdited, userID, description, projectID)
		VALUES(?, ?, ?, ?, ?, ?)`, data, function (err, value) {
		if (err) {
			console.log(err)
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}
		else {
			return res.status(200).json({ message: 'Clocked in successfully.' });
		}
	});
	/*}
	else{//clocking out
	  console.log("clocking out.");
	  let isNullTimeOut = false;
	  let ID = 0;
	  rows.every(row => {
		isNullTimeOut = row["timeOut"] === null;
		if(isNullTimeOut){
		  ID = row["timeslotID"];
		  return false;
		}
		return true;*/
}
