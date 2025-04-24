const ConnectToDB = require('../../database/DBConnection');

let db = ConnectToDB();

exports.CreateNewGroup = async (req, res, next) => {
    console.log("MiscellaneousControllers.js file/CreateNewGroup route called");

    function isEmpty(str) {
        return (!str || str.length === 0);
    }

    console.log("Running createGroup");

    // Can't use dictionaries for queries so order matters!
    let data = [];
    data[0] = req.body["groupName"];
    data[1] = req.body["isActive"];
    data[2] = 1;

    console.log(data);

    db.run(`INSERT INTO Groups(groupName, isActive, projectID) VALUES(?, ?, ?)`, data, function (err, rows) {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        } else {
            console.log(data);
            return res.status(200).json({ group: data });
        }
    });
}
