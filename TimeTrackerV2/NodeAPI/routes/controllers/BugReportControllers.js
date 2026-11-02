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

    console.log(data);

    db.run(`INSERT INTO Bug_Reports(userID, description, name) VALUES(?, ?, ?)`, data, function (err, rows) {
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

	let sql = `SELECT Bug_Reports.bugReportID, Bug_Reports.description, Bug_Reports.name, Users.type
    FROM Bug_Reports
    LEFT JOIN Users ON Bug_Reports.userID = Users.userID
    WHERE Bug_Reports.isResolved = 0`;

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

	let sql = `SELECT Bug_Reports.bugReportID, Bug_Reports.description, Bug_Reports.name, Users.type
    FROM Bug_Reports
    LEFT JOIN Users ON Bug_Reports.userID = Users.userID
    WHERE Bug_Reports.isResolved = 1`;

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

	let bugReportID = req.body["bugReportID"];
    console.log(JSON.stringify(req.body));

    let sql = `UPDATE Bug_Reports
    SET isResolved = 1
    WHERE bugReportID = ?`;

    db.run(sql, [bugReportID], (err, value) => {
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

	let bugReportID = req.body["bugReportID"];
    console.log(JSON.stringify(req.body));

    let sql = `UPDATE Bug_Reports
    SET isResolved = 0
    WHERE bugReportID = ?`;

    db.run(sql, [bugReportID], (err, value) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'The update was unsuccessful.' });
        }
        else {
            return res.status(200).json({ message: 'Bug report marked as unresolved.' });
        }
    });
}