// We use this because we are making multiple connections to the DB from the controllers files and the seed file
const sqlite3 = require('sqlite3').verbose();

const ConnectToDB = () => {
    let db = new sqlite3.Database('./database/main.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error(err.message);
            application.quit(1);
        }
    });

    db.get("PRAGMA foreign_keys = ON");  // Turn on foreign keys for the DB connection https://stackoverflow.com/a/53085206

    return db;  // Return the connection to the calling function
};

module.exports = ConnectToDB;