const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/main.db');

exports.GetTotalTimeForAllUsersInCourse = (req, res) => {
    console.log("TimeCardControllers.js file/GetTotalTimeForAllUsersInCourse route called");

    let courseID = req.params["courseID"];
    console.log("courseID: " + courseID);

    // This sql statement currently only selects the users if they have created a time card, need it so that it also selects them if they don't have a time card
    let sql = `SELECT u.userID, u.firstName || " " || u.lastName As studentName, p.projectName, SUM(tc.timeOut - timeIn) AS totalTime
		FROM TimeCard tc
        INNER JOIN Users u ON tc.userID = u.userID
        INNER JOIN Projects p ON tc.projectID = p.projectID
        WHERE p.courseID = ${courseID}
        GROUP BY studentName, p.projectName
        ORDER BY studentName, p.projectName`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            let currentUserID;
            let dataToBeAdded = {};
            let returnData = [];

            // Go through every row returned and process it for the client
            rows.forEach((row, index) => {
                console.log("Processing the row: " + JSON.stringify(row));
                // if it is a new user
                if (row.userID != currentUserID) {
                    // If they are not the first row being processed
                    if (index != 0) {
                        returnData.push(dataToBeAdded);
                    }
                    currentUserID = row.userID;
                    
                    // Replace what is currently stored inside the variable dataToBeAdded with the current data in the row
                    dataToBeAdded = {
                        studentName: row.studentName,
                        projects: [{
                            projectName: row.projectName,
                            totalTime: row.totalTime,
                        }],
                    }
                }
                // The user is already been processed before, so simply append the data to the projects portion of the dataToBeAdded
                else {
                    dataToBeAdded.projects.push({
                        projectName: row.projectName,
                        totalTime: row.totalTime,
                    });
                }
            });

            // Add the very last item processed to the returnData array 
            returnData.push(dataToBeAdded);

            console.log("Resulting data that made after processing the rows:\n" + JSON.stringify(returnData));

            // Return the processed data back to the client
            return res.send(returnData);
        }
    });
}

exports.test = (req, res) => {
    console.log("TimeCardControllers.js file/test route called");

    let courseID = req.params["courseID"];
    console.log("courseID: " + courseID);

    // This sql statement currently only selects the users if they have created a time card, need it so that it also selects them if they don't have a time card
    let sql = `SELECT u.userID, u.firstName || " " || u.lastName As studentName, SUM(tc.timeOut - timeIn) AS totalTime
		FROM TimeCard tc
        RIGHT OUTER JOIN Users u ON tc.userID = u.userID  -- Grab all users regardless if they have a time card or not
        GROUP BY studentName`;
        // inside the SELECT ", p.projectName"
        // WHERE p.courseID = ${courseID}
        // RIGHT OUTER JOIN Projects p ON tc.projectID = p.projectID
        // inside the GROUP BY ", p.projectName"


    db.all(sql, [], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            return res.send(rows);
        }
    });
}


exports.GetAllTimeCardsForUserInProject = (req, res) => {
    console.log("TimeCardControllers.js file/GetAllTimeCardsForUserInProject route called");

    let userID = req.params["userID"];
    let projectID = req.params["projectID"];
    console.log("userID: " + userID + ", projectID: " + projectID);

    let sql = `SELECT timeIn, timeOut, description
    	FROM TimeCard
    	WHERE userID = ? AND projectID = ?`;

    db.all(sql, [userID, projectID], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            return res.send(rows);
        }
    });
}

exports.GetAllTimeCardsForUser = (req, res) => {
    console.log("TimeCardControllers.js file/GetAllTimeCardsForUser route called");

    let userID = req.params["userID"];
    console.log("userID: " + userID);

    let sql = `SELECT timeIn, timeOut, description
		FROM TimeCard
        WHERE userID = ${userID}`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            return res.send(rows);
        }
    });
}

exports.SaveTimeCard = async (req, res, next) => {
    console.log("TimeCardControllers.js file/SaveTimeCard route called");
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
