const ConnectToDB = require('../../Database/DBConnection');
const insertAudit = require('./AuditLog')

let db = ConnectToDB();

exports.GetReportsData = (req, res) => {
    console.log("TimeCardControllers.js file/GetReportsData route called");

    let courseID = req.params["courseID"];
    console.log("courseID: " + courseID);

    // Report on the current course roster, including each student's current and historical projects.
    let sql = `SELECT u.userID, u.firstName || " " || u.lastName AS studentName, p.projectID, p.projectName, SUM(tc.timeOut - tc.timeIn) AS totalTime
    FROM Users u
    INNER JOIN Course_Users cu ON cu.userID = u.userID
    INNER JOIN Courses c ON c.courseID = cu.courseID
    LEFT OUTER JOIN Projects p ON p.courseID = c.courseID AND (
        EXISTS (SELECT 1 FROM Project_Users pu
            WHERE pu.userID = u.userID AND pu.projectID = p.projectID)
        OR EXISTS (SELECT 1 FROM TimeCard history
            WHERE history.userID = u.userID AND history.projectID = p.projectID)
    )
    LEFT OUTER JOIN TimeCard tc ON tc.userID = u.userID AND tc.projectID = p.projectID
    WHERE c.courseID = ?
    GROUP BY u.userID, studentName, p.projectID, p.projectName
    ORDER BY studentName, p.projectName`;

    db.all(sql, [courseID], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            const reportsByUserID = new Map();

            rows.forEach((row) => {
                console.log("Processing the row: " + JSON.stringify(row));
                if (!reportsByUserID.has(row.userID)) {
                    reportsByUserID.set(row.userID, {
                        userID: row.userID,
                        studentName: row.studentName,
                        projects: [],
                    });
                }
                reportsByUserID.get(row.userID).projects.push({
                    projectID: row.projectID,
                    projectName: row.projectName,
                    totalTime: row.totalTime,
                });
            });

            const returnData = [...reportsByUserID.values()];

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
    const description = req.body.description;

    if (description !== undefined && typeof description !== 'string') {
        return res.status(400).json({
            message: 'Description must be text.'
        });
    }

    const data = [
        req.body.timeIn,
        req.body.timeOut,
        description ?? null,
        req.body.timeslotID
    ];

    const sql = `UPDATE TimeCard
        SET timeIn = ?, timeOut = ?, description = COALESCE(?, description)
        WHERE timeslotID = ?`;

    db.run(sql, data, function (err) {
        if (err) {
            return res.status(500).json({
                message: 'Something went wrong. Please try again later.'
            });
        }

        return res.status(200).json({ project: data });
    });
};

exports.GetTimeCardInfo = (req, res) => {
    console.log("TimeCardControllers.js file/GetTimeCardInfo route called");

    let timeslotID = req.params["id"];
    console.log("timeslotID: " + timeslotID);

    let sql = `SELECT u.firstName || " " || u.lastName AS studentName,
                  t.timeIn, t.timeOut, t.description
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
