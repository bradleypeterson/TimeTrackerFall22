const ConnectToDB = require('../../database/DBConnection');

let db = ConnectToDB();

exports.GetReportsData = (req, res) => {
    console.log("TimeCardControllers.js file/GetReportsData route called");

    let courseID = req.params["courseID"];
    console.log("courseID: " + courseID);

    // This sql statement is intended to select all students that are part of a course and will at the same time, grabs all the projects they are a part of, even if they are not have any time cards for them.  Such as when they have just joined the course, they would not be assigned to a project yet to make a time card.
    let sql = `SELECT u.userID, u.firstName || " " || u.lastName AS studentName, p.projectID, p.projectName, SUM(tc.timeOut - tc.timeIn) AS totalTime
    -- Joins to get the students and courses for the students
    FROM Users u
    INNER JOIN Course_Users cu ON cu.userID = u.userID
    INNER JOIN Courses c ON c.courseID = cu.courseID
    -- Joins to grab the time cards and projects for the students
    LEFT OUTER JOIN Project_Users pu ON pu.userID = u.userID  -- Grab the connections to the projects the user is assigned to, but if they are not connected to any projects, return null.  An issue occurs here, what if the user is part of a group and has made some timecards, but then they are voted out or they leave, this would make it so that the name of the project would be null, thus not display the project to the user.  Need to find some solution to fix this or leave it so it only displays all the projects that the user is currently in.
    LEFT OUTER JOIN Projects p ON p.projectID = pu.projectID  -- Grab all the projects the user has worked on, but if they have not part of the project, return null.
    LEFT OUTER JOIN TimeCard tc ON tc.userID = u.userID AND tc.projectID = p.projectID  -- Grab all the time cards that the user has made for the project, but if the user has not made any time cards, return null.
    -- Sort/Organize the data
    WHERE c.courseID = ?
    GROUP BY u.userID, studentName, p.projectName
    ORDER BY studentName, p.projectName`;

    db.all(sql, [courseID], (err, rows) => {
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
                        userID: row.userID,
                        studentName: row.studentName,
                        projects: [{
                            projectID: row.projectID,
                            projectName: row.projectName,
                            totalTime: row.totalTime,
                        }],
                    }
                }
                // The user is already been processed before, so simply append the data to the projects portion of the dataToBeAdded
                else {
                    dataToBeAdded.projects.push({
                        projectID: row.projectID,
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
        WHERE userID = ?`;

    db.all(sql, [userID], (err, rows) => {
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

    let userID = req.body["userID"];
    let currentDate = new Date(Date.now());  // This is formatted this way so we can grab the year, month, and day from the variable in the below code.
    // We don't grab the UTC Year, Month, and Day (Date = day of the month) because the source, currentDate, is already in UTC.  It doesn't need to be converted.
    let LNMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0); // LN = Last Night
    let TNMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 0, 0, 0, 0); // TN = To Night

    // For debugging, we don't convert to UTC because the root date, currentDate, is already in UTC time and all the other variables are derived from it
    // Last night midnight
    console.log("LNMidnight:");
    console.log(LNMidnight.toString());
    console.log(LNMidnight.getTime());
    // Current 
    console.log("currentDate:");
    console.log(currentDate.toString());
    console.log(currentDate.getTime());
    // Tonight midnight
    console.log("TNMidnight:");
    console.log(TNMidnight.toString());
    console.log(TNMidnight.getTime());

    let countSQL = `SELECT COUNT(timeslotID) AS manualEntryCountForToday
        FROM TimeCard
        WHERE userID = ? AND isManualEntry = ? AND timeCardCreation BETWEEN ? AND ?`;  

    // Can't use dictionaries for queries so order matters!
    let selectData = [];
    selectData[0] = userID;
    selectData[1] = true ? 1 : 0;  // We have to format this entry this way because the DB stores it as 1 for true and 0 for false
    selectData[2] = LNMidnight.getTime();
    selectData[3] = TNMidnight.getTime();

    db.all(countSQL, selectData, (err, row) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        else {
            console.log(`Manual created today for the userID ${userID}: ${row[0].manualEntryCountForToday} ${row[0].manualEntryCountForToday >= 5 ? " LIMIT REACHED" : ""}`);
            // If they have reached the 5 manual entries for the day
            if (row[0].manualEntryCountForToday >= 5) {
                return res.status(429).json({ message: 'You have reached your limit for manual time card submissions for today.\nIf you wish to add more, contact your instructor.' });  // HTTP status 429 is for "Too Many Requests".  If you want a list of HTTP requests, look in this link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
            }
            // They have not reached the 5 manual entries for the day, enter the timecard to the DB
            else {
                let insertData = [];
                insertData[0] = currentDate
                insertData[1] = req.body["isManualEntry"];
                insertData[2] = req.body["timeIn"];
                insertData[3] = req.body["timeOut"];
                insertData[4] = req.body["isEdited"];
                insertData[5] = userID;
                insertData[6] = req.body["description"];
                insertData[7] = req.body["projectID"];

                db.run(`INSERT INTO TimeCard(timeCardCreation, isManualEntry, timeIn, timeOut, isEdited, userID, description, projectID)
                    VALUES(?, ?, ?, ?, ?, ?, ?, ?)`, insertData, function (err, value) {
                    if (err) {
                        console.log(err);
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
        }
    });
}

exports.DeleteTimeCard = async (req, res, next) => {
    console.log("TimeCardControllers.js file/DeleteTimeCard route called");

    let timeslotID = req.body["timeslotID"];
    console.log(timeslotID);

    let sql = 'DELETE FROM TimeCard WHERE timeslotID = ?;';

    db.run(sql, [timeslotID], function (err, value) {
        if (err) {
            console.log(err)
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        else {
            console.log("inside else")
            return res.status(200).json({ message: 'Timecard deleted.' });
        }
    });
}

exports.EditTimeCard = async (req, res, next) => {
    console.log("TimeCardControllers.js file/EditTimeCard route called");

    let data = [];
    data[0] = req.body["timeIn"];
    data[1] = req.body["timeOut"];
    data[2] = req.body["timeslotID"];

    sql = `UPDATE TimeCard
    SET timeIn = ?, timeOut = ?
    WHERE timeslotID = ?`;

    db.run(sql, data, function (err, rows) {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        } else {
            return res.status(200).json({ project: data });
        }
    });
}

exports.GetTimeCardInfo = (req, res) => {
    console.log("TimeCardControllers.js file/GetTimeCardInfo route called");

    let timeslotID = req.params["timeslotID"];
    console.log("timeslotID: " + timeslotID);

    let sql = `SELECT u.firstName || " " || u.lastName AS studentName, t.timeIn, t.timeOut
		FROM TimeCard t
        INNER JOIN Users u ON u.userID = t.userID
        WHERE t.timeslotID = ?`;

    db.all(sql, [timeslotID], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            return res.send(rows);
        }
    });
}