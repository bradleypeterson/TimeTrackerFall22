const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const db = new sqlite3.Database('./database/main.db');

exports.Register = async (req, res, next) => {
	function isEmpty(str) {
		return (!str || str.length === 0);
	}

	if (isEmpty(req.body["username"]) ||
		isEmpty(req.body["firstName"]) ||
		isEmpty(req.body["lastName"]) ||
		isEmpty(req.body["type"]) ||
		isEmpty(req.body["password"]) ||
		isEmpty(req.body["repeatPassword"])) {
		return res.status(400).json({ message: 'Missing one or more required arguments.' });
	};

	// Validate user doesn't already exist
	let sql = `SELECT *
		FROM Users
		WHERE username = ?`;
	db.get(sql, [req.body["username"]], (err, rows) => {

		if (err) {
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}

		if (rows) {
			return res.status(400).json({ message: 'A user of this name already exists' });
		}

		// Validate passwords match
		if (req.body["password"] !== req.body["repeatPassword"]) {
			return res.status(400).json({ message: 'Given passwords do not match' });
		}

		let salt = crypto.randomBytes(16).toString('hex');

		let hash = crypto.pbkdf2Sync(req.body["password"], salt,
			1000, 64, `sha512`).toString(`hex`);

		let data = [];

		// Can't use dictionaries for queries so order matters!
		data[0] = req.body["username"];
		data[1] = hash;
		data[2] = req.body["firstName"];
		data[3] = req.body["lastName"];
		data[4] = req.body["type"];
		data[5] = false;
		data[6] = salt;

		db.run(`INSERT INTO Users(username, password, firstName, lastName, type, isActive, salt) VALUES(?, ?, ?, ?, ?, ?, ?)`, data, function (err, rows) {
			if (err) {
				return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
			} else {
				return res.status(200).json({ message: 'User registered' });
			}
		});
	});
}

exports.Login = async (req, res, next) => {
	function isEmpty(str) {
		return (!str || str.length === 0);
	}

	if (isEmpty(req.body["username"]) ||
		isEmpty(req.body["password"])) {
		return res.status(400).json({ message: 'Missing one or more required arguments.' });
	};

	let sql = `SELECT *
		FROM Users
		WHERE username = ?`;
	db.get(sql, [req.body["username"]], (err, rows) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
		}

		if (rows) {
			salt = rows['salt']

			let hash = crypto.pbkdf2Sync(req.body["password"], salt,
				1000, 64, `sha512`).toString(`hex`);

			if (rows['password'] === hash) {
				return res.status(200).json({ user: rows });
			} else {
				return res.status(401).json({ message: 'Username or password is incorrect.' });
			}
		} else {
			return res.status(401).json({ message: 'Username or password is incorrect.' });
		}
	});
}
