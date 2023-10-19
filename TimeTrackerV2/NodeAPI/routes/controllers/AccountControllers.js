const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const db = new sqlite3.Database('./database/main.db');

exports.Register = async (req, res, next) => {
	console.log("AccountControllers.js file/Register route called");

	let username = req.body["username"];
	let firstName = req.body["firstName"];
	let lastName = req.body["lastName"];
	let type = req.body["type"];
	let password = req.body["password"];
	let repeatPassword = req.body["repeatPassword"];

	function isEmpty(str) {
		return (!str || str.length === 0);
	}

	if (isEmpty(username) ||
		isEmpty(firstName) ||
		isEmpty(lastName) ||
		isEmpty(type) ||
		isEmpty(password) ||
		isEmpty(repeatPassword)) {
		return res.status(400).json({ message: 'Missing one or more required arguments.' });
	};

	// Validate user doesn't already exist
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

		// Validate passwords match
		if (password !== repeatPassword) {
			return res.status(400).json({ message: 'Given passwords do not match' });
		}

		let salt = crypto.randomBytes(16).toString('hex');

		let hash = crypto.pbkdf2Sync(password, salt,
			1000, 64, `sha512`).toString(`hex`);

		let sql = `INSERT INTO Users(username, password, firstName, lastName, type, isActive, salt)
			VALUES(?, ?, ?, ?, ?, ?, ?)`;

		// Can't use dictionaries for queries so order matters!
		let data = [];
		data[0] = username;
		data[1] = hash;
		data[2] = firstName;
		data[3] = lastName;
		data[4] = type;
		data[5] = false;  // Don't know why this is false, I (Braxton) would think this would be true because I think these refers to if the account is active or disabled and if you are registering, you would be making an active account.
		data[6] = salt;

		db.run(sql, data, function (err, rows) {
			if (err) {
				return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
			} else {
				return res.status(200).json({ message: 'User registered' });
			}
		});
	});
}

exports.Login = async (req, res, next) => {
	console.log("AccountControllers.js file/Login route called");

	let username = req.body["username"];
	let password = req.body["password"];

	function isEmpty(str) {
		return (!str || str.length === 0);
	}

	if (isEmpty(username) ||
		isEmpty(password)) {
		return res.status(400).json({ message: 'Missing one or more required arguments.' });
	};

	let sql = `SELECT *
		FROM Users
		WHERE username = ?`;

	db.get(sql, [username], (err, rows) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}
		if (rows) {
			salt = rows['salt'];

			let hash = crypto.pbkdf2Sync(password, salt,
				1000, 64, `sha512`).toString(`hex`);

			if (rows['password'] === hash) {
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

    let sql = `DELETE FROM Users
    WHERE userID = ${userID}`;

    db.run(sql, [], (err, result) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}
		if (result) {
            console.log("Rows affected: " + result.affectedRows)
            return res.status(200).json({ message: 'User has been deleted.' });
        }
	});
}
