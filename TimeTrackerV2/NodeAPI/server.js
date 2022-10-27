const cors = require('cors'); 
const express = require('express');
const mongoose = require('mongoose'); 
const crypto = require('crypto'); 
const sqlite3 = require('sqlite3').verbose();

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// Database
const db = new sqlite3.Database('./database/main.db');

// App
const app = express();
app.use(cors());
app.use(express.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  return res.send('Hello World');
});

app.get('/Courses', (req, res) => {
  var rowData = "";
  let sql = "SELECT courseName FROM Courses";
  db.all(sql, [], (err, rows) => {
    if(err) {
      return res.status(500).json({message: 'Something went wrong. Please try again later.'});
    }
    if(rows) {
      rowData += "[";
      rows.forEach((row) => {
        rowData += '{"courseName": "' + row.courseName + '"},';
      });
      rowData += "]";
      rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
      return res.send(rowData);
    }
  });
});

app.get('/Users', (req, res) => {
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
});

app.post('/register', async (req, res, next) => {

  function isEmpty(str) {
    return (!str || str.length === 0 );
  }

  if(isEmpty(req.body["username"]) ||
  isEmpty(req.body["firstName"]) ||
  isEmpty(req.body["lastName"]) ||
  isEmpty(req.body["password"]) ||
  isEmpty(req.body["type"]) ||
  isEmpty(req.body["repeatPassword"])) {
    return res.status(400).json({message: 'Missing one or more required arguments.'});
  };

  // Validate user doesn't already exist
  let sql = `SELECT * FROM Users WHERE username = ?`;
  db.get(sql, [req.body["username"]], (err, rows) => {

    if (err) {
      return res.status(500).json({message: 'Something went wrong. Please try again later.'});
    }

    if(rows) {
      return res.status(400).json({message: 'A user of this name already exists'});
    }

    // Validate passwords match
    if(req.body["password"] !== req.body["repeatPassword"]) {
      return res.status(400).json({message: 'Given passwords do not match'});
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

    db.run(`INSERT INTO Users(username, password, firstName, lastName, type, isActive, salt) VALUES(?, ?, ?, ?, ?, ?, ?)`, data, function(err, rows) {
      if (err) {
        return res.status(500).json({message: 'Something went wrong. Please try again later.'});
      } else {
        return res.status(200).json({message: 'User registered'});
      }
    });
  });
});

app.post('/login', async (req, res, next) => {
  function isEmpty(str) {
    return (!str || str.length === 0 );
  }


  if(isEmpty(req.body["username"]) ||
  isEmpty(req.body["password"])) {
    return res.status(400).json({message: 'Missing one or more required arguments.'});
  };

  let sql = `SELECT * FROM Users WHERE username = ?`;
  db.get(sql, [req.body["username"]], (err, rows) => {
    if (err) {
      return res.status(500).json({message: 'Something went wrong. Please try again later.'});
    }

    if(rows) {
      salt = rows['salt']

      let hash = crypto.pbkdf2Sync(req.body["password"], salt,  
      1000, 64, `sha512`).toString(`hex`);

      if(rows['password'] === hash) {
        return res.status(200).json({user: rows});
      } else {
        return res.status(401).json({message: 'Username or password is incorrect.'});
      }
    } else {
      return res.status(401).json({message: 'Username or password is incorrect.'});
    }
  });
});

app.post('/createGroup', async (req, res, next) => {
    function isEmpty(str) {
        return (!str || str.length === 0);
    }

    console.log("Running createGroup");

    let data = [];

    // Can't use dictionaries for queries so order matters!
    data[0] = req.body["groupName"];
    data[1] = req.body["isActive"];
    data[2] = 1;

    console.log(data);

    db.run(`INSERT INTO Groups(groupName, isActive, projectID) VALUES(?, ?, ?)`, data, function (err, rows) {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        } else {
            console.log(data);
            return res.status(200).json({group: data});
        }
    });
});

app.post('/createCourse', async (req, res, next) => {
  function isEmpty(str) {
      return (!str || str.length === 0);
  }

  console.log("Running createCourse");

  let data = [];

  // Can't use dictionaries for queries so order matters!
  data[0] = req.body["courseName"];
  data[1] = req.body["isActive"];
  data[2] = 1;
  data[3] = "This is your new course";

  console.log(data);

  db.run(`INSERT INTO Courses(courseName, isActive, instructorID, description) VALUES(?, ?, ?, ?)`, data, function (err, rows) {
      if (err) {
          return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
      } else {
          return res.status(200).json({course: data});
      }
  });
});

app.post('/createProject', async (req, res, next) => {
  function isEmpty(str) {
      return (!str || str.length === 0);
  }

  console.log("Running createProject");

  let data = [];

  // Can't use dictionaries for queries so order matters!
  data[0] = req.body["projectName"];
  data[1] = req.body["isActive"];
  data[2] = 1;
  data[3] = "This is your new project";

  console.log(data);

  db.run(`INSERT INTO Projects(projectName, isActive, courseID, description) VALUES(?, ?, ?, ?)`, data, function (err, rows) {
      if (err) {
          return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
      } else {
          console.log(rows);
          return res.status(200).json({project: data});
      }
  });
});

app.post('/clock', async (req, res, next) => {
  /*function isEmpty(str) {
    return (!str || str.length === 0 );
  }
  
  let isValid = true;
  let isClockin = req.body["timeIn"] !== null;
  let sql = `SELECT * FROM TimeCard WHERE UserID = ?`;
  db.all(sql, [req.body["userID"]], (error, rows) => 
  {
    if (error) {
      return res.status(500).json({message: 'Something went wrong. Please try again later.'});
    }

    if(isClockin){
      console.log("clocking in.");
      rows.forEach(row => {
        isValid = (row['timeOut'] !== null);
      });

      if(!isValid){
        return res.status(400).json({message: 'you have an outstanding clock in. Please clock out.'});
      }*/

      let data = [];

      data[0] = req.body["timeIn"];
      data[1] = req.body["timeOut"];
      data[2] = req.body["createdOn"];
      data[3] = req.body["userID"];
      data[4] = req.body["description"];

      db.run(`INSERT INTO TimeCard(timeIn, isEdited, createdOn, userID, description) VALUES(?, ?, ?, ?, ?)`, data, function(err,value){
        if(err){
          console.log(err)
          return res.status(500).json({message: 'Something went wrong. Please try again later.'});
        }
        else{
          return res.status(200).json({message: 'Clocked in successfully.'});
        }
      });
    /*}
    else{//clocking out
      console.log("clocking out.");
      let isNullTimeOut = false;
      let ID = 0;
      rows.every(row => {
        isNullTimeOut = row["timeOut"] === null;
        if(isNullTimeOut){
          ID = row["timeslotID"];
          return false;
        }
        return true;
      });

      isValid = isNullTimeOut;

      if(!isValid){
        return res.status(400).json({message: 'No outstanding clock in. Please clock in first.'});
      }

      let data = [];
      data[0] = req.body["timeOut"];
      data[1] = req.body["description"];
      data[2] = ID;

      db.run(`UPDATE TimeCard SET timeOut = ? , description = ? WHERE timeslotID = ? `, data, function(err, value){
        if(err){
          console.log(err)
          return res.status(500).json({message: 'Something went wrong. Please try again later.'});
        }
        else{
          return res.status(200).json({message: 'Clocked out successfully.'});
        }
      });
    }
  }); */
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
require('./database/seed.js');