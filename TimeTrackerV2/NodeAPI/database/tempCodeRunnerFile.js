const ConnectToDB = require("./DBConnection");

let db = ConnectToDB();
//localStorage = new localStorage("./scratch");

db.run("PRAGMA journal_mode = DELETE;", (err) => {
    if (err) {
        console.log('Error disabling WAL mode:', err);
    } else {
        console.log('WAL mode disabled. Journal mode is now DELETE.');
    }
});