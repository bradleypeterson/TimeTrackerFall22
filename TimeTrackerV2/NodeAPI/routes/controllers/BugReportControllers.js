const ConnectToDB = require('../../Database/DBConnection');
const insertAudit = require('./AuditLog')

let db = ConnectToDB();


exports.CreateBugReport = async (req, res, next) => {
    console.log("BugReportControllers.js file/CreateBugReport route called");

    function isEmpty(str) {
        return (!str || str.length === 0);
    }

    // Can't use dictionaries for queries so order matters!
    let data = [];
    data[0] = req.body["userID"];
    data[1] = req.body["description"];
    data[2] = req.body["name"];
    data[3] = req.body["creationDate"]
    data[4] = req.body["lastUpdateDate"];

    console.log(data);

    db.run(`INSERT INTO Bug_Reports(userID, description, name, creationDate, lastUpdateDate) VALUES(?, ?, ?, ?, ?)`, data, function (err, rows) {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        } else {
            console.log(data);
            return res.status(200).json({ bug_report: data });
        }
    });
}

exports.GetUnresolvedIssues = async (req, res) => {
    console.log("BugReportControllers.js file/GetUnresolvedIssues route called");

	let sql = `SELECT b.bugReportID, b.description, b.name, u.type, b.creationDate
    FROM Bug_Reports b
    LEFT JOIN Users u ON b.userID = u.userID
    WHERE b.isResolved = 0
    ORDER BY b.lastUpdateDate DESC LIMIT 10`;

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

exports.GetResolvedIssues = async (req, res) => {
    console.log("BugReportControllers.js file/GetResolvedIssues route called");

	let sql = `SELECT b.bugReportID, b.description, b.name, u.type, b.creationDate
    FROM Bug_Reports b
    LEFT JOIN Users u ON b.userID = u.userID
    WHERE b.isResolved = 1
    ORDER BY b.lastUpdateDate`;

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

exports.MarkIssueResolved = async (req, res) => {
    console.log("BugReportControllers.js file/MarkIssueResolved route called");

    let data = [];
    data[0] = req.body["lastUpdateDate"];
    data[1] = req.body["bugReportID"];

    let sql = `UPDATE Bug_Reports
    SET lastUpdateDate = ?, isResolved = 1
    WHERE bugReportID = ?`;

    db.run(sql, data, (err, value) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'The update was unsuccessful.' });
        }
        else {
            return res.status(200).json({ message: 'Bug report marked as resolved.' });
        }
    });
}

exports.MarkIssueUnresolved = async (req, res) => {
    console.log("BugReportControllers.js file/MarkIssueUnresolved route called");

	let data = [];
    data[0] = req.body["lastUpdateDate"];
    data[1] = req.body["bugReportID"];

    let sql = `UPDATE Bug_Reports
    SET lastUpdateDate = ?, isResolved = 0
    WHERE bugReportID = ?`;

    db.run(sql, data, (err, value) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'The update was unsuccessful.' });
        }
        else {
            return res.status(200).json({ message: 'Bug report marked as unresolved.' });
        }
    });
}