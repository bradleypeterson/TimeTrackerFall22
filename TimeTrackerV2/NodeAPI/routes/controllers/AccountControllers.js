var localStorage = require('node-localstorage').LocalStorage;
const crypto = require('crypto');
const ConnectToDB = require('../../database/DBConnection');

let db = ConnectToDB();
localStorage = new localStorage('./scratch');

exports.Register = async (req, res, next) => {
	console.log("AccountControllers.js file/Register route called");

	let username = req.body["username"];
	let firstName = req.body["firstName"];
	let lastName = req.body["lastName"];
	let type = req.body["type"];
	let password = req.body["password"];
	let salt = req.body["salt"];

	// Validate user doesn't already exist (can be handled by the unique constraint, but this is left in so we have more control without having to determine what cause the error)
	let sql = `SELECT *
		FROM Users
		WHERE username = ?`;

	db.get(sql, [username], (err, rows) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}

		if (rows) {
			return res.status(400).json({ message: 'A user of this name already exists' });
		}
        
        let sql = `INSERT INTO Users(username, password, firstName, lastName, type, isActive, salt)
        VALUES(?, ?, ?, ?, ?, ?, ?)`;
    
        // Can't use dictionaries for queries so order matters!
        let data = [];
        data[0] = username;
        data[1] = password;
        data[2] = firstName;
        data[3] = lastName;
        data[4] = type;
        data[5] = true;
        data[6] = salt;
    
        db.run(sql, data, function (err, rows) {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: 'Something went wrong in creating the account. Please try again later.' });
            } else {
                return res.status(200).json({ message: 'User registered' });
            }
        });
	});
}

exports.GrabSaltForUser = (req, res) => {
	console.log("AccountControllers.js file/GrabSaltForUsername route called");

    let username = req.params["username"];
    console.log(`Searching for user with the username of "${username}"`);

    let sql = `SELECT salt
    FROM Users
    WHERE username = ?`;

    db.get(sql, [username], (err, row) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}
		if (row) {
            console.log("Salt found, returning it back to client");
            res.send(JSON.stringify(row['salt']));
		}
		else {
			console.log("No user with that username, unable to grab a salt value");
			return res.status(401).json({ message: 'Username or password is incorrect.' });
		}
    });
}

exports.Login = async (req, res, next) => {
	console.log("AccountControllers.js file/Login route called");

	let username = req.body["username"];
	let password = req.body["password"];
    console.log(`username: ${username} password: ${password}`);

	let sql = `SELECT *
		FROM Users
		WHERE username = ?`;

	db.get(sql, [username], (err, rows) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}
		if (rows) {
            // If the passwords match and the user is active
			if (rows['password'] === password && rows['isActive'] === 1) {  // we use 1 as true because the DB uses 1 as true and 0 as false
                console.log("User authenticated");
				return res.status(200).json({ user: rows });
			}
            // If the passwords do not match
            else if (rows['password'] !== password) {
				console.log("Wrong Password");
				return res.status(401).json({ message: 'Username or password is incorrect.' });
			}
            // The account has been disabled
            else {
                console.log("User not active");
                return res.status(403).json({ message: 'Account has been disabled.'});
            }
		}
		else {
			console.log("No user with that username");
			return res.status(401).json({ message: 'Username or password is incorrect.' });
		}
	});
}

exports.DeleteAccount = async (req, res, next) => {
	console.log("AccountControllers.js file/DeleteAccount route called");

    let userID = req.body.userID;
    console.log("userID: " + userID);

    let sql = `DELETE
    FROM Users
    WHERE userID = ?`;

    db.run(sql, [userID], (err, value) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}
		else {
            return res.status(200).json({ message: 'The account has been deleted.' });
        }
	});
}

exports.DefaultAdminAccountCreated = async (req, res, next) => {
    console.log("AccountControllers.js file/DefaultAdminAccountCreated route called");

    // The below variable is set in the seed.js file and if it is true, then the default admin account has been generated.
    let CreatedOrEnabled = JSON.parse(localStorage.getItem('defaultAdminCreatedOrEnabledAndNotViewed')) === true;

    console.log(`defaultAdminCreatedOrEnabledAndNotViewed: ${CreatedOrEnabled}`)

    if(CreatedOrEnabled) {
        res.send(true);
        localStorage.setItem('defaultAdminCreatedOrEnabledAndNotViewed', false);  //this will make it so that only the first person that uses this API call will see the message.
    }
    else {
        res.send(false);
    }
}

exports.ChangePassword = (req, res) => {
    console.log("AccountControllers.js file/ChangePassword route called");

    let userID = req.params["userID"];
    console.log(JSON.stringify(req.body));
    let password = req.body.password;
    let salt = req.body.salt;

    let sql = `UPDATE Users
    SET password = ?, salt = ?
    WHERE userID = ?`;

    db.run(sql, [password, salt, userID], (err, value) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ message: 'Something went wrong in resetting the user\'s password.\nPlease try again later.' });
		}
		else {
            return res.status(200).json({ message: 'The user\'s password has been changed.' });
        }
    });
}

exports.UpdateUserInfo = (req, res) => {
    console.log("AccountControllers.js file/UpdateAccountInfo route called");

    //"firstName":"sudo","lastName":"admin","type":"admin","isActive":0
    let userID = req.body["userID"];
    let username = req.body["username"];
    let firstName = req.body["firstName"];
    let lastName = req.body["lastName"];
    let type = req.body["type"];
    let isActive = req.body["isActive"];

    let data = [];
    data[0] = username;
    data[1] = firstName;
    data[2] = lastName;
    data[3] = type;
    data[4] = isActive;
    data[5] = userID;

    let sql = `UPDATE Users
    SET username = ?, firstName = ?, lastName = ?, type = ?, isActive = ?
    WHERE userID = ?`;

    db.run(sql, data, (err, value) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ message: 'Something went wrong in saving the changes for the user.\nPlease try again later.' });
		}
		else {
            return res.status(200).json({ message: 'The changes to the user has been saved.' });
        }
    });

}