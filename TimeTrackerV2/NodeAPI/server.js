const cors = require('cors'); 
const express = require('express');
const mongoose = require('mongoose'); 
const crypto = require('crypto'); 
const sqlite3 = require('sqlite3').verbose();

const ExternalRoutes = require("./routes/routes")  //include our "routes.js" module so we can use it inside this file.  Module documentation https://www.w3schools.com/nodejs/nodejs_modules.asp

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// Database
const db = new sqlite3.Database('./database/main.db');

// App
const app = express();
app.use(cors({
  origin: "http://localhost:4200",  //added with professor (allows the supplied url to talk to the server)
  credentials: true  // Allows credentials from the origin
}));
app.use(express.json({
  extended: false
}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  return res.send('Hello World');
});

// using our routes we defined inside our "routes.js" file
app.use("/api", ExternalRoutes);  //adds our custom http responses from the file specified for "ExternalRoutes"

// app.get('/Courses', (req, res) => {
//   console.log("/Course called")
//   var rowData = "";
//   let sql = "SELECT courseName, courseID, description FROM Courses";
//   db.all(sql, [], (err, rows) => {
//     if(err) {
//       return res.status(500).json({message: 'Something went wrong. Please try again later.'});
//     }
//     if(rows) {
//       rowData += "[";
//       rows.forEach((row) => {
//         rowData += '{"courseName": "' + row.courseName + '", "courseID": "' + row.courseID + '", "description": "' + row.description + '"},';
//       });
//       rowData += "]";
//       rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
//       return res.send(rowData);
//     }
//   });
// });

// app.get('/Courses/:id', (req, res) => { // dynamic courses based on instructor id
//   console.log("/Course/:id called")
//   var rowData = "";
//   let instructorID = req.params["id"];
//   let sql = 'SELECT courseName, courseID, description FROM Courses WHERE instructorID = ' + instructorID;
//   db.all(sql, [], (err, rows) => {
//     if(err) {
//       return res.status(500).json({message: 'Something went wrong. Please try again later.'});
//     }
//     if(rows) {
//       rowData += "[";
//       rows.forEach((row) => {
//         rowData += '{"courseName": "' + row.courseName + '", "courseID": "' + row.courseID + '", "description": "' + row.description + '"},';
//       });
//       rowData += "]";
//       rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
//       return res.send(rowData);
//     }
//   });
// });

// app.get('/Add-Courses', async (req, res) => {
//   console.log("/Add-Courses called")
//   const courses = await db.all('SELECT * FROM Courses')
//   res.send('CourseList', {courses})
// });



// app.get('/Users', (req, res) => {
//   console.log("/Users called")
//   var rowData = "";
//   let sql = "SELECT username, firstName, lastName FROM Users";
//   db.all(sql, [], (err, rows) => {
//     if(err) {
//       return res.status(500).json({message: 'Something went wrong. Please try again later.'});
//     }
//     if(rows) {
//       rowData += "[";
//       rows.forEach((row) => {
//         rowData += '{"username": "' + row.username + '", "firstName": "' + row.firstName + '", "lastName": "' + row.lastName + '"},';
//       });
//       rowData += "]";
//       rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
//       return res.send(rowData);
//     }
//   });
// });

// app.get('/Users/:userId/:projectID/activities', (req, res) => {
//   console.log("/Users/:userId/:projectID/activities called")
//   var rowData = "";
//   let userId = req.params["userId"];
//   let projectID = req.params["projectID"];
//   let sql = `SELECT timeIn, timeOut, description FROM TimeCard WHERE userID = ${userId} AND projectID = ${projectID}`;
//   db.all(sql, [], (err, rows) => {
//     if(err) {
//       return res.status(500).json({message: 'Something went wrong. Please try again later.'});
//     }
//     if(rows) {
//       rowData += "[";
//       rows.forEach((row) => {
//         rowData += '{"timeIn": "' + row.timeIn + '", "timeOut": "' + row.timeOut + '", "description": "' + row.description + '"},';
//       });
//       rowData += "]";
//       rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
//       return res.send(rowData);
//     }
//   });
// });

// app.get('/Users/:userId/activities', (req, res) => {
//   console.log("/Users/:userId/activities called")
//   var rowData = "";
//   let userId = req.params["userId"];
//   let sql = `SELECT timeIn, timeOut, description FROM TimeCard WHERE userID = ${userId}`;
//   db.all(sql, [], (err, rows) => {
//     if(err) {
//       return res.status(500).json({message: 'Something went wrong. Please try again later.'});
//     }
//     if(rows) {
//       rowData += "[";
//       rows.forEach((row) => {
//         rowData += '{"timeIn": "' + row.timeIn + '", "timeOut": "' + row.timeOut + '", "description": "' + row.description + '"},';
//       });
//       rowData += "]";
//       rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
//       return res.send(rowData);
//     }
//   });
// });

// app.post('/register', async (req, res, next) => {
//   console.log("/register called")

//   function isEmpty(str) {
//     return (!str || str.length === 0 );
//   }

//   if(isEmpty(req.body["username"]) ||
//   isEmpty(req.body["firstName"]) ||
//   isEmpty(req.body["lastName"]) ||
//   isEmpty(req.body["password"]) ||
//   isEmpty(req.body["type"]) ||
//   isEmpty(req.body["repeatPassword"])) {
//     return res.status(400).json({message: 'Missing one or more required arguments.'});
//   };

//   // Validate user doesn't already exist
//   let sql = `SELECT * FROM Users WHERE username = ?`;
//   db.get(sql, [req.body["username"]], (err, rows) => {

//     if (err) {
//       return res.status(500).json({message: 'Something went wrong. Please try again later.'});
//     }

//     if(rows) {
//       return res.status(400).json({message: 'A user of this name already exists'});
//     }

//     // Validate passwords match
//     if(req.body["password"] !== req.body["repeatPassword"]) {
//       return res.status(400).json({message: 'Given passwords do not match'});
//     }
    
//     let salt = crypto.randomBytes(16).toString('hex');
        
//     let hash = crypto.pbkdf2Sync(req.body["password"], salt,  
//       1000, 64, `sha512`).toString(`hex`);

//     let data = [];

//     // Can't use dictionaries for queries so order matters!
//     data[0] = req.body["username"];
//     data[1] = hash;
//     data[2] = req.body["firstName"];
//     data[3] = req.body["lastName"];
//     data[4] = req.body["type"];
//     data[5] = false;
//     data[6] = salt;

//     db.run(`INSERT INTO Users(username, password, firstName, lastName, type, isActive, salt) VALUES(?, ?, ?, ?, ?, ?, ?)`, data, function(err, rows) {
//       if (err) {
//         return res.status(500).json({message: 'Something went wrong. Please try again later.'});
//       } else {
//         return res.status(200).json({message: 'User registered'});
//       }
//     });
//   });
// });

// app.post('/login', async (req, res, next) => {
//   console.log("/login called")
//   function isEmpty(str) {
//     return (!str || str.length === 0 );
//   }


//   if(isEmpty(req.body["username"]) ||
//   isEmpty(req.body["password"])) {
//     return res.status(400).json({message: 'Missing one or more required arguments.'});
//   };

//   let sql = `SELECT * FROM Users WHERE username = ?`;
//   db.get(sql, [req.body["username"]], (err, rows) => {
//     if (err) {
//       return res.status(500).json({message: 'Something went wrong. Please try again later.'});
//     }

//     if(rows) {
//       salt = rows['salt']

//       let hash = crypto.pbkdf2Sync(req.body["password"], salt,  
//       1000, 64, `sha512`).toString(`hex`);

//       if(rows['password'] === hash) {
//         return res.status(200).json({user: rows});
//       } else {
//         return res.status(401).json({message: 'Username or password is incorrect.'});
//       }
//     } else {
//       return res.status(401).json({message: 'Username or password is incorrect.'});
//     }
//   });
// });

// app.post('/createGroup', async (req, res, next) => {
//     console.log("/createGroup called")
//     function isEmpty(str) {
//         return (!str || str.length === 0);
//     }

//     console.log("Running createGroup");

//     let data = [];

//     // Can't use dictionaries for queries so order matters!
//     data[0] = req.body["groupName"];
//     data[1] = req.body["isActive"];
//     data[2] = 1;

//     console.log(data);

//     db.run(`INSERT INTO Groups(groupName, isActive, projectID) VALUES(?, ?, ?)`, data, function (err, rows) {
//         if (err) {
//             return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
//         } else {
//             console.log(data);
//             return res.status(200).json({group: data});
//         }
//     });
// });

// app.post('/clock', async (req, res, next) => {
//   console.log("/clock called")
//   /*function isEmpty(str) {
//     return (!str || str.length === 0 );
//   }
  
//   let isValid = true;
//   let isClockin = req.body["timeIn"] !== null;
//   let sql = `SELECT * FROM TimeCard WHERE UserID = ?`;
//   db.all(sql, [req.body["userID"]], (error, rows) => 
//   {
//     if (error) {
//       return res.status(500).json({message: 'Something went wrong. Please try again later.'});
//     }

//     if(isClockin){
//       console.log("clocking in.");
//       rows.forEach(row => {
//         isValid = (row['timeOut'] !== null);
//       });

//       if(!isValid){
//         return res.status(400).json({message: 'you have an outstanding clock in. Please clock out.'});
//       }*/

//       let data = [];

//       data[0] = req.body["timeIn"];
//       data[1] = req.body["timeOut"];
//       data[2] = req.body["isEdited"];
//       data[3] = req.body["userID"];
//       data[4] = req.body["description"];
//       data[5] = req.body["projectID"];

//       db.run(`INSERT INTO TimeCard(timeIn, timeOut, isEdited, userID, description, projectID) VALUES(?, ?, ?, ?, ?, ?)`, data, function(err,value){
//         if(err){
//           console.log(err)
//           return res.status(500).json({message: 'Something went wrong. Please try again later.'});
//         }
//         else{
//           return res.status(200).json({message: 'Clocked in successfully.'});
//         }
//       });
//     /*}
//     else{//clocking out
//       console.log("clocking out.");
//       let isNullTimeOut = false;
//       let ID = 0;
//       rows.every(row => {
//         isNullTimeOut = row["timeOut"] === null;
//         if(isNullTimeOut){
//           ID = row["timeslotID"];
//           return false;
//         }
//         return true;*/
// });

// app.get('/Projects', (req, res) => {
//   console.log("/Projects called")
//   var rowData = "";
//   let sql = "SELECT p.projectName, p.projectID, p.description, c.courseName FROM Projects as p INNER JOIN Courses as c ON p.courseID = c.courseID";
//   db.all(sql, [], (err, rows) => {
//     if(err) {
//       return res.status(500).json({message: 'Something went wrong. Please try again later.'});
//     }
//     if(rows) {
//       rowData += "[";
//       rows.forEach((row) => {
//         rowData += '{"projectName": "' + row.projectName + '", "projectID": ' + row.projectID + ', "description": "' + row.description + '", "courseName": "' + row.courseName + '"},';
//       });
//       rowData += "]";
//       rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
//       console.log(rowData);
//       return res.send(rowData);
//     }
//   });
// });

// app.get('/Projects/:id/Users', (req, res) => {
//   console.log("/Projects/:id/Users called")
//   var rowData = "";
//   let projectID = req.params["id"];
//   console.log("projectID: " + projectID);
//   let sql = `SELECT DISTINCT u.userID, u.firstName, u.lastName, t.timeIn, t.timeOut FROM Users as u INNER JOIN Project_Users as pu ON u.userID = pu.userID LEFT JOIN TimeCard as t ON u.userID = t.userID WHERE t.projectID = ${projectID}`;
//   db.all(sql, [], (err, rows) => {
//     if(err) {
//       return res.status(500).json({message: 'Something went wrong. Please try again later.'});
//     }
//     if(rows) {
//       rowData += "[";
//       rows.forEach((row) => {
//         console.log("userID: " + row.userID + ", firstName: " + row.firstName + ", lastName: " + row.lastName + ", timeIn: " + row.timeIn + ", timeOut: " + row.timeOut);
//         rowData += '{"userID": "' + row.userID + '", "firstName": "' + row.firstName + '", "lastName": "' + row.lastName + '", "timeIn": ' + row.timeIn + ', "timeOut": ' + row.timeOut + '},';
//       });
//       rowData += "]";
//       console.log("rowData before slice " + rowData);
//       rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
//       console.log("rowData after slice " + rowData);
//       return res.send(rowData);
//     }
//   });
// });

app.get('/Users/:userId/getUserCourses', (req, res) => {
  console.log("/Users/:userId/getUserCourses called")
  var rowData = "";
  let userId = req.params["userId"];
  let sql = `SELECT c.*, u.firstname, u.lastName from Courses c JOIN Course_Users cu ON cu.courseID
  = c.courseID JOIN Users u on u.userID = c.instructorID AND cu.userID = ${userId}`;
  db.all(sql, [], (err, rows) => {
    if(err) {
      return res.status(500).json({message: 'Something went wrong. Please try again later.'});
    }
    if(rows) {
      rowData += "[";
      rows.forEach((row) => {
        rowData += '{"courseID": "' + row.courseID + '", "courseName": "' + row.courseName + '", "instructorFN": "' + row.firstName + '", "instructorLN": "' + row.lastName + '", "description": "' + row.description + '"},';
      });
      rowData += "]";
      rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
      return res.send(rowData);
    }
  });
});

app.get('/Users/:userId/getNonUserCourses', (req, res) => {
  console.log("/Users/:userId/getNonUserCourses called")
  var rowData = "";
  let userId = req.params["userId"];
  let sql = `select c.*, u.firstname, u.lastname from Courses c JOIN Users
  u where u.userID = c.instructorID AND c.courseID
  not in (select c.courseID from Courses c
  join Course_Users cu ON cu.courseID = c.courseID AND cu.userID = ${userId})`;
  db.all(sql, [], (err, rows) => {
    if(err) {
      return res.status(500).json({message: 'Something went wrong. Please try again later.'});
    }
    if(rows) {
      rowData += "[";
      rows.forEach((row) => {
        rowData += '{"courseID": "' + row.courseID + '", "courseName": "' + row.courseName + '", "instructorFN": "' + row.firstName + '", "instructorLN": "' + row.lastName + '", "description": "' + row.description + '"},';
      });
      rowData += "]";
      rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
      return res.send(rowData);
    }
  });
});

app.post('/addUserCourse', async (req, res, next) => {
  console.log("/addUserCourse called")
  let data = [];

  data[0] = req.body["userID"];
  data[1] = req.body["courseID"];

  db.run(`INSERT INTO Course_Users(userID, courseID) VALUES(?, ?)`, data, function(err,value){
    if(err){
      console.log(err)
      return res.status(500).json({message: 'Something went wrong. Please try again later.'});
    }
    else{
      return res.status(200).json({message: 'User Course added.'});
    }
  });
});

app.post('/deleteUserCourse', async (req, res, next) => {
  console.log("/deleteUserCourse called")
  let data = [];

  data[0] = req.body["userID"];
  data[1] = req.body["courseID"];
  let sql = `delete from Course_Users where courseID = ${data[1]} and userID = ${data[0]};`;

  db.run(sql, function(err,value){
    if(err){
      console.log(err)
      return res.status(500).json({message: 'Something went wrong. Please try again later.'});
    }
    else{
      return res.status(200).json({message: 'User Course deleted.'});
    }
  });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
require('./database/seed.js');

app.post('/createCourse', async (req, res, next) => {
  console.log("/createCourse called")

  function isEmpty(str) {
      return (!str || str.length === 0);
  }

  let data = [];
  data[0] = req.body["courseName"];
  data[1] = req.body["isActive"];
  data[2] = req.body["instructorID"];
  data[3] = req.body["description"];

  db.run('INSERT INTO Courses(courseName, isActive, instructorID, description) VALUES(?, ?, ?, ?)', data, function (err, rows) {
      if (err) {
          return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
      } else {
          return res.status(200).json({course: data});
      }
  });
});

app.post('/createProject', async (req, res, next) => {
  console.log("/createProject called")
  function isEmpty(str) {
      return (!str || str.length === 0);
  }

  let data = [];
  data[0] = req.body["projectName"];
  data[1] = req.body["isActive"];
  data[2] = req.body["courseID"];
  data[3] = req.body["description"];

  db.run('INSERT INTO Projects(projectName, isActive, courseID, description) VALUES(?, ?, ?, ?)', data, function (err, rows) {
      if (err) {
          return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
      } else {
          return res.status(200).json({project: data});
      }
  });
});

app.get('/Projects/:id', (req, res) => { // grab all projects based on provided courseid
  console.log("/Projects/:id called")
  var rowData = "";
  let courseID = req.params["id"];
  let sql = 'SELECT projectName, projectID, description FROM Projects WHERE courseID = ' + courseID;
  db.all(sql, [], (err, rows) => {
    if(err) {
      return res.status(500).json({message: 'Something went wrong. Please try again later.'});
    }
    if(rows) {
      rowData += "[";
      rows.forEach((row) => {
        rowData += '{"projectName": "' + row.projectName + '", "projectID": "' + row.projectID + '", "description": "' + row.description + '"},';
      });
      rowData += "]";
      rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
      return res.send(rowData);
    }
  });
});