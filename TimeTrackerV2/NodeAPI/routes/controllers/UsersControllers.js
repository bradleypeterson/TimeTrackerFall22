const ConnectToDB = require('../../database/DBConnection');

let db = ConnectToDB();

exports.GetUserInfo = (req, res) => {
    console.log("UsersControllers.js file/GetFirstLastUserName route called");

    let userID = req.params["id"];
    console.log("userID: " + userID)

    let sql = `SELECT firstName, lastName, type, isActive
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

    let sql = `SELECT userID, username, firstName, lastName, type, isActive
        FROM Users`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            return res.send(rows);
        }
    });
}

exports.GetUserProfile = (req, res) => {
    console.log("UsersControllers.js file/GetUserProfile route called");

    let userID = req.params["userID"];

    let sql = `SELECT u.firstName, u.lastName, p.pronouns, p.bio, p.contact, u.userID
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