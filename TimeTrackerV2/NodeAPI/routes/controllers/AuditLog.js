const ConnectToAudit = require('../../Database/create_audit');
const ConnectToDB = require('../../Database/DBConnection');
let db = ConnectToDB();
let al = ConnectToAudit();

function insertAudit(userID, event, description){
    const sql = `INSERT INTO AuditLog(actor, event, description, timestamp) VALUES (?, ?, ?, ?)`
    const timestamp = new Date().toISOString();

    const data = [userID, event, description, timestamp]

    al.run(sql, data, (err) => {
        if(err){
            console.log("Error inserting audit log", err);
        }
        else{
            console.log("Audit Created")
        }
    });
}

module.exports = insertAudit;