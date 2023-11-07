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
        data[5] = false;  // Don't know why this is false, I (Braxton) would think this would be true because I think these refers to if the account is active or disabled and if you are registering, you would be making an active account.
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

	let sql = `SELECT *
		FROM Users
		WHERE username = ?`;

	db.get(sql, [username], (err, rows) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}
		if (rows) {
			if (rows['password'] === password) {
				return res.status(200).json({ user: rows });
			} else {
				console.log("Wrong Password");
				return res.status(401).json({ message: 'Username or password is incorrect.' });
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
            return res.status(200).json({ message: 'The user has been deleted.' });
        }
	});
}

exports.DefaultAdminAccountCreated = async (req, res, next) => {
    console.log("AccountControllers.js file/DefaultAdminAccountCreated route called");

    // The below variable is set in the seed.js file and if it is true, then the default admin account has been generated.
    let defaultAdminCreatedAndNotViewed = JSON.parse(localStorage.getItem('defaultAdminCreatedAndNotViewed')) === true;

    console.log(`defaultAdminCreatedAndNotViewed: ${defaultAdminCreatedAndNotViewed}`)

    if(defaultAdminCreatedAndNotViewed) {
        res.send(true);
        localStorage.setItem('defaultAdminCreatedAndNotViewed', false);  //this will make it so that only the first person that uses this API call will see the message.
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