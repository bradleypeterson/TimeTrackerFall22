const sqlite3 = require('sqlite3').verbose();

const ConnectToAudit = () => {
    let al = new sqlite3.Database('./database/Audit_Log.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error(err.message);
            process.exit(1); 
        }
    });

    al.get("PRAGMA foreign_keys = ON"); 

    return al;
}

let al = ConnectToAudit();

al.run(`CREATE TABLE IF NOT EXISTS AuditLog(
    Actor INTEGER,
    Event TEXT,
    Description TEXT,
    TimeStamp TEXT
);`);

al.close()

module.exports = ConnectToAudit;