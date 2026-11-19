const ConnectToDB = require('../../database/DBConnection');

const db = ConnectToDB();

// The Angular route guard controls navigation; the API enforces admin access.
exports.RequireIssueAdmin = (req, res, next) => {
    const userID = req.session?.userID;
    if (!userID) {
        return res.status(401).json({ message: 'Please log in again.' });
    }
    db.get(
        'SELECT userID FROM Users WHERE userID = ? AND type = ? AND isActive = 1 AND isApproved = 1',
        [userID, 'admin'],
        (err, admin) => {
            if (err) {
                return res.status(500).json({ message: 'Unable to verify issue access.' });
            }
            if (!admin) {
                return res.status(403).json({ message: 'Administrator access is required.' });
            }
            return next();
        }
    );
};


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


    db.run(`INSERT INTO Bug_Reports(userID, description, name, creationDate, lastUpdateDate) VALUES(?, ?, ?, ?, ?)`, data, function (err, rows) {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        } else {
            return res.status(200).json({ bug_report: data });
        }
    });
}


exports.CreateAccountHelpRequest = (req, res) => {
    const field = (key) => typeof req.body?.[key] === 'string' ? req.body[key].trim() : '';
    const name = field('name');
    const username = field('username');
    const replyEmail = field('replyEmail');
    const description = field('description');

    if (!name || name.length > 120 || username.length > 200 ||
        !description || description.length > 2000 || replyEmail.length > 254 ||
        !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z0-9-]+$/i.test(replyEmail)) {
        return res.status(400).json({ message: 'Enter your name, a valid reply email, and a short description.' });
    }
    const now = new Date().toISOString();
    db.run(
        `INSERT INTO Account_Help_Requests (name, username, replyEmail, description, creationDate, lastUpdateDate)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, username, replyEmail, description, now, now],
        (err) => err
            ? res.status(500).json({ message: 'Could not submit your request. Please try again.' })
            : res.status(201).json({ message: 'Request submitted.' })
    );
};

function listIssues(resolved) {
    return (_req, res) => {
        const sql = `SELECT b.bugReportID, b.description, b.name, u.type,
                            'bug' AS category, NULL AS username, NULL AS replyEmail, b.lastUpdateDate
                     FROM Bug_Reports b LEFT JOIN Users u ON b.userID = u.userID
                     WHERE b.isResolved = ?
                     UNION ALL
                     SELECT requestID, description, name, NULL, 'account-access', username, replyEmail, lastUpdateDate
                     FROM Account_Help_Requests WHERE isResolved = ?
                     ORDER BY lastUpdateDate DESC`;

        db.all(sql, [resolved, resolved], (err, rows) => err
            ? res.status(500).json({ message: 'Could not load issues. Please try again.' })
            : res.json(rows));
    };
}

function markIssue(resolved) {
    return (req, res) => {
        const id = req.body?.bugReportID;
        const category = req.body?.category ?? 'bug';
        if (!Number.isSafeInteger(id) || id < 1 || !['bug', 'account-access'].includes(category)) {
            return res.status(400).json({ message: 'A valid issue is required.' });
        }

        const sql = category === 'account-access'
            ? 'UPDATE Account_Help_Requests SET lastUpdateDate = ?, isResolved = ? WHERE requestID = ?'
            : 'UPDATE Bug_Reports SET lastUpdateDate = ?, isResolved = ? WHERE bugReportID = ?';

        db.run(sql, [new Date().toISOString(), resolved, id], function (err) {
            if (err) return res.status(500).json({ message: 'The update was unsuccessful.' });
            if (!this.changes) return res.status(404).json({ message: 'Issue not found.' });
            return res.json({ message: resolved ? 'Issue marked as resolved.' : 'Issue reopened.' });
        });
    };
}

exports.GetUnresolvedIssues = listIssues(0);
exports.GetResolvedIssues = listIssues(1);
exports.MarkIssueResolved = markIssue(1);
exports.MarkIssueUnresolved = markIssue(0);
