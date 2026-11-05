const ConnectToDB = require('../../Database/DBConnection');
const insertAudit = require('./AuditLog')

let db = ConnectToDB();

exports.GetUserInfo = (req, res) => {
    console.log("UsersControllers.js file/GetFirstLastUserName route called");

    let userID = req.params["id"];
    console.log("userID: " + userID)

    // added isApproved
    let sql = `SELECT firstName, lastName, type, isApproved, isActive
        FROM Users
        WHERE userID = ?`;

    db.get(sql, [userID], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            return res.send(rows);
        }
    });
}

exports.GetUsersInfo = (req, res) => {
    console.log("UsersControllers.js file/GetUsersInfo route called");

    // added isApproved
    let sql = `SELECT userID, username, firstName, lastName, type, isApproved, isActive
        FROM Users`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong in grabbing the users. Please try again later.' });
        }
        if (rows) {
            return res.send(rows);
        }
    });
}

exports.GetUserProfile = (req, res) => {
    console.log("UsersControllers.js file/GetUserProfile route called");

    let userID = req.params["userID"];

    let sql = `SELECT u.firstName, u.lastName, u.username, p.pronouns, p.bio, p.contact, u.userID
        FROM Users u
        INNER JOIN Profiles p ON u.userID = p.userID
        WHERE u.userID = ?`

    db.all(sql, [userID], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            return res.send(rows);
        }
    });
    
}

exports.EditUserInfo = (req, res) => {
    console.log("UsersControllers.js file/EditUserInfo route called");

    let data = [];
    data[0] = req.body["username"];
    data[1] = req.body["firstName"];
    data[2] = req.body["lastName"];
    data[3] = req.body["userID"];
    data[4] = req.body["oldUsername"];

    //First we check if the new username already exists and isn't the same as the old one
    let sql = `SELECT *
		FROM Users
		WHERE username = ?`;

    db.get(sql, data[0], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows && data[0] != data[4]) {
            return res.status(400).json({ message: 'A user of this name already exists' });
        }
        sql = `UPDATE Users
        SET username = ?, firstName = ?, lastName = ?
        WHERE userID = ?`;

        db.run(sql, [data[0], data[1], data[2], data[3]], function (err, rows) {
            if (err) {
                return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
            } else {
                return res.status(200).json({ course: data });
            }
        });
    });
}

exports.EditUserProfile = (req, res) => {
    console.log("UsersControllers.js file/EditUserProfile route called");

    let data = [];
    data[0] = req.body["pronouns"];
    data[1] = req.body["bio"];
    data[2] = req.body["contact"];
    data[3] = req.body["userID"];

    sql = `UPDATE Profiles
    SET pronouns = ?, bio = ?, contact = ?
    WHERE userID = ?`;

    db.run(sql, data, function (err, rows) {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        } else {
            return res.status(200).json({ course: data });
        }
    });
}

exports.GetRecentUsers = (req, res) => {
    console.log("UsersControllers.js file/GetRecentUsers route called");

    sql = `SELECT firstName, lastName, userID
    FROM Users ORDER BY userID DESC LIMIT 8`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            return res.send(rows);
        }
    });
}

exports.GetUsersPendingApproval = (req, res) => {
    console.log("UsersController.js file/GetUsersPendingApproval route called");

    let sql = `SELECT COUNT(*) as count
               FROM Users
               WHERE isApproved = 0`;

    db.get(sql, [], (err, row) => {
        if (err) {
            console.error("Error fetching users pending approval:", err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(row);  // Returns count of users waiting for approval
    });
}

// added isApproved to all relevant statements