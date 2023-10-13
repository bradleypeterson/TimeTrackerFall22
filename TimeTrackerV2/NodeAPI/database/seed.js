const { Database } = require('sqlite3');

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./database/main.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the main database.');
  });

db.get("PRAGMA foreign_keys = ON");

db.run(`CREATE TABLE IF NOT EXISTS Users(userID INTEGER PRIMARY KEY, 
                            username TEXT NOT NULL,
                            password TEXT NOT NULL,
                            firstName TEXT NOT NULL,
                            lastName TEXT NOT NULL,
                            type TEXT NOT NULL,
                            isActive BOOL NOT NULL,
                            salt TEXT NOT NULL);`);

// Create a super admin account with a username and password of "admin"
/*currently doesn't work if you are making a new Database, it crashes with the error:
undefined:0

[Error: SQLITE_ERROR: no such table: Users
Emitted 'error' event on Statement instance at:
] {
  errno: 1,
  code: 'SQLITE_ERROR'
}

But once the database has been created the first time, it works.
*/
/*db.run(`INSERT INTO Users(username, password, firstName, lastName, type, isActive, salt)
    SELECT "admin", "b30425b2679cfee195e07569ec1f933bac6a12759b74eccba310e75afe1313da45af4438e4be69b998d4c3bbd5ad1c990ecb6c76b8072580b49990a065ac81b6", "sudo", "admin", "admin", false, "21d20429770a51657e5b6c245c796d79"
    WHERE NOT EXISTS(SELECT 1 FROM Users WHERE username = "admin");`);*/

db.run(`CREATE TABLE IF NOT EXISTS TimeCard(timeslotID INTEGER PRIMARY KEY, 
                            timeIn TEXT NOT NULL,
                            timeOut TEXT,
                            isEdited bool NOT NULL,
                            userID INTEGER NOT NULL,
                            description TEXT,
                            projectID INT NOT NULL,
                            FOREIGN KEY (userID) REFERENCES Users (userID) ON DELETE CASCADE,
                            FOREIGN KEY (projectID) REFERENCES Projects (projectID) ON DELETE CASCADE);`);

db.run(`CREATE TABLE IF NOT EXISTS Courses(courseID INTEGER PRIMARY KEY, 
                            courseName TEXT NOT NULL,
                            isActive BOOL NOT NULL,
                            instructorID INTEGER NOT NULL,
                            description TEXT,
                            FOREIGN KEY (instructorID) REFERENCES Users (userID) ON DELETE CASCADE);`);

db.run(`CREATE TABLE IF NOT EXISTS Projects(projectID INTEGER PRIMARY KEY, 
                            projectName TEXT NOT NULL,
                            isActive BOOL NOT NULL,
                            courseID INTEGER NOT NULL,
                            description TEXT,
                            FOREIGN KEY (courseID) REFERENCES Courses (courseID) ON DELETE CASCADE);`);

db.run(`CREATE TABLE IF NOT EXISTS Course_Users (userID INTEGER NOT NULL,
                            courseID INTEGER NOT NULL,
                            FOREIGN KEY (userID) REFERENCES Users (userID) ON DELETE CASCADE,
                            FOREIGN KEY (courseID) REFERENCES Courses (courseID) ON DELETE CASCADE);`);
  
db.run(`CREATE TABLE IF NOT EXISTS Project_Users (userID INTEGER NOT NULL,
                            projectID INTEGER NOT NULL,
                            FOREIGN KEY (userID) REFERENCES Users (userID) ON DELETE CASCADE,
                            FOREIGN KEY (projectID) REFERENCES Projects (projectID) ON DELETE CASCADE);`);
