const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/main.db');

exports.GetAllCoursesNamesIDs =  (req, res) => {
  console.log("/Course called")
  var rowData = "";
  let sql = "SELECT courseName, courseID, description FROM Courses";
  db.all(sql, [], (err, rows) => {
    if(err) {
    return res.status(500).json({message: 'Something went wrong. Please try again later.'});
    }
    if(rows) {
    rowData += "[";
    rows.forEach((row) => {
        rowData += '{"courseName": "' + row.courseName + '", "courseID": "' + row.courseID + '", "description": "' + row.description + '"},';
    });
    rowData += "]";
    rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
    return res.send(rowData);
    }
  });
}

exports.GetAllCoursesForInstructorID = (req, res) => { // dynamic courses based on instructor id
  console.log("/Course/:id called")
  var rowData = "";
  let instructorID = req.params["id"];
  let sql = 'SELECT courseName, courseID, description FROM Courses WHERE instructorID = ' + instructorID;
  db.all(sql, [], (err, rows) => {
    if(err) {
    return res.status(500).json({message: 'Something went wrong. Please try again later.'});
    }
    if(rows) {
    rowData += "[";
    rows.forEach((row) => {
        rowData += '{"courseName": "' + row.courseName + '", "courseID": "' + row.courseID + '", "description": "' + row.description + '"},';
    });
    rowData += "]";
    rowData = rowData.slice(0, rowData.length - 2) + rowData.slice(-1);
    return res.send(rowData);
    }
  });
}

exports.GetAllCourses = async (req, res) => {
  console.log("/Add-Courses called")
  const courses = await db.all('SELECT * FROM Courses')
  res.send('CourseList', {courses})
}