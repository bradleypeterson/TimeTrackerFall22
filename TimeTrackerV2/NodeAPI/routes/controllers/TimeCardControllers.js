const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/main.db');

exports.GetReportsData = (req, res) => {
    console.log("TimeCardControllers.js file/GetTotalTimeForAllUsersInCourse route called");

    let courseID = req.params["courseID"];
    console.log("courseID: " + courseID);

    // This sql statement is intended to select all students that are part of a course and will at the same time, grabs all the projects they have/are been a part of, even if they are not have any time cards for them.  Such as when they have just joined course, they would not be assigned to a project yet to make a time card.
    let sql = `SELECT u.userID, u.firstName || " " || u.lastName AS studentName, p.projectID, p.projectName, SUM(tc.timeOut - tc.timeIn) AS totalTime
    -- Joins to get the students and courses for the students
    FROM Users u
    INNER JOIN Course_Users cu ON cu.userID = u.userID
    INNER JOIN Courses c ON c.courseID = cu.courseID
    -- Joins to grab the time cards and projects for the students
    LEFT OUTER JOIN Project_Users pu ON pu.userID = u.userID  -- Grab the connections to the projects the user is assigned to, but if they are not connected to any projects, return null.  An issue occurs here, what if the user is part of a group and has made some timecards, but then they are voted out or they leave, this would make it so that the name of the project would be null, thus not display the project to the user.  Need to find some solution to fix this or leave it and leave it so it only displays all the projects that the user is currently in.
    LEFT OUTER JOIN Projects p ON p.projectID = pu.projectID  -- Grab all the projects the user has worked on, but if they have not part of the project, return null.
    LEFT OUTER JOIN TimeCard tc ON tc.userID = u.userID AND tc.projectID = p.projectID  -- Grab all the time cards that the user has made for the project, but if the user has not made any time cards, return null.
    -- Sort/Organize the data
    WHERE c.courseID = ${courseID}
    GROUP BY u.userID, studentName, p.projectName
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
