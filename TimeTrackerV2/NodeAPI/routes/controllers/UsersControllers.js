const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/main.db');

exports.GetFirstLastUserName = (req, res) => {
  console.log("/Users called")
  var rowData = "";
  let sql = "SELECT username, firstName, lastName FROM Users";
    db.all(sql, [], (err, rows) => {
        if(err) {
        return res.status(500).json({message: 'Something went wrong. Please try again later.'});
        }
        if(rows) {
        rowData += "[";
        rows.forEach((row) => {
            rowData += '{"username": "' + row.username + '", "firstName": "' + row.firstName + '", "lastName": "' + row.lastName + '"},';
        });
        rowData += "]";
        rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
        return res.send(rowData);
        }
  });
}