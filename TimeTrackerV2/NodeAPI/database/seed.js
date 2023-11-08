var localStorage = require('node-localstorage').LocalStorage;
const ConnectToDB = require('./DBConnection');

let db = ConnectToDB();
localStorage = new localStorage('./scratch');

//db.serialize();  // Serialize all following commands (not needed because we only need to serialize the Users and Profile tables and all actions attached to them) https://stackoverflow.com/questions/72620312/in-node-sqlite3-how-to-wait-until-run-is-finished

// Run the following database commands in serialized mode. I.E. only one statement can execute at a time. Other statements will wait in a queue until all the previous statements are executed.  https://www.sqlitetutorial.net/sqlite-nodejs/statements-control-flow/
db.serialize(() => {
    // Create the Users table
    db.run(`CREATE TABLE IF NOT EXISTS Users(
        userID INTEGER PRIMARY KEY, 
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        type TEXT NOT NULL,
        isActive BOOL NOT NULL,
        salt TEXT NOT NULL
        );`)
        // Create the Profiles table
        .run(`CREATE TABLE IF NOT EXISTS Profiles(
        userID INTEGER NOT NULL,
        pronouns TEXT,
        bio TEXT,
        contact TEXT,
        FOREIGN KEY (userID) REFERENCES Users (userID) ON DELETE CASCADE
        );`)
        //  Create a trigger for the Users table that will insert a new entry into the Profiles table
        .run(`CREATE TRIGGER IF NOT EXISTS usersTrigger
        AFTER INSERT ON Users
        BEGIN
            INSERT INTO Profiles(userID) VALUES (new.userID);
        END;`)
        // Create a super admin account with a username and password of "admin" if there are no admins in the DB
        // It is formatted this way because the syntax order for this type of insert has to be INSERT ... SELECT instead of INSERT ... VALUES https://stackoverflow.com/a/66644198 and https://mitch.codes/sql-tip-insert-where-not-exists/
        .run(`INSERT INTO Users(username, password, firstName, lastName, type, isActive, salt)
        SELECT 'admin', '729698d2e7e3f792312a663f441767813c2e15465836f2c11300f9daafbd9fc36da0c0dc1e06c02e473e8fb76a8e58ad4673e9d833304ccaa733c2d667bb1fc1', 'sudo', 'admin', 'admin', false, '851d1de4be2b408af82cb83255136747'
        WHERE NOT EXISTS (
            SELECT userID
            FROM Users
            WHERE type = 'admin'
            LIMIT 1
        );`, [], function (err) {  // Can' use a lambda function for some reason as described here https://github.com/TryGhost/node-sqlite3/issues/962 and as shown here https://medium.com/@codesprintpro/getting-started-sqlite3-with-nodejs-8ef387ad31c4#:~:text=without%20touching%20it.-,Executing%20run()%20Method,-All%20the%20above
            if (err) {
                console.log('The following error happened with the insert of the default admin.');
                console.log(err);
                localStorage.setItem('defaultAdminCreatedAndNotViewed', false);
            }
            // If the a row was inserted, then "this.lastID" returns the ID of the row it was inserted into.  And because any thing above 0 is considered true, set the variable "global.defaultAdminCreated" to true because the default admin account was inserted.
            else if(this.lastID) {
                console.log(`Default admin account created with an ID of: ${this.lastID}`);
                localStorage.setItem('defaultAdminCreatedAndNotViewed', true);
            }
            else {
                localStorage.setItem('defaultAdminCreatedAndNotViewed', false);
            }
        });
});

// Create the TimeCard table
db.run(`CREATE TABLE IF NOT EXISTS TimeCard(
    timeslotID INTEGER PRIMARY KEY,
    timeCardCreation TEXT NOT NULL,
    isManualEntry bool NOT NULL,
    timeIn TEXT NOT NULL,
    timeOut TEXT,
    isEdited bool NOT NULL,
    userID INTEGER NOT NULL,
    description TEXT,
    projectID INT NOT NULL,
    FOREIGN KEY (userID) REFERENCES Users (userID) ON DELETE CASCADE,
    FOREIGN KEY (projectID) REFERENCES Projects (projectID) ON DELETE CASCADE
);`);

// Create the Courses table
db.run(`CREATE TABLE IF NOT EXISTS Courses(
    courseID INTEGER PRIMARY KEY, 
    courseName TEXT NOT NULL,
    isActive BOOL NOT NULL,
    instructorID INTEGER NOT NULL,
    description TEXT,
    FOREIGN KEY (instructorID) REFERENCES Users (userID) ON DELETE CASCADE
);`);

// Create the Projects table
db.run(`CREATE TABLE IF NOT EXISTS Projects(
    projectID INTEGER PRIMARY KEY, 
    projectName TEXT NOT NULL,
    isActive BOOL NOT NULL,
    courseID INTEGER NOT NULL,
    description TEXT,
    FOREIGN KEY (courseID) REFERENCES Courses (courseID) ON DELETE CASCADE
);`);

// Create the Course_Users join table
db.run(`CREATE TABLE IF NOT EXISTS Course_Users(
    userID INTEGER NOT NULL,
    courseID INTEGER NOT NULL,
    FOREIGN KEY (userID) REFERENCES Users (userID) ON DELETE CASCADE,
    FOREIGN KEY (courseID) REFERENCES Courses (courseID) ON DELETE CASCADE
);`);

// Create the Project_Users join table
db.run(`CREATE TABLE IF NOT EXISTS Project_Users(
    userID INTEGER NOT NULL,
    projectID INTEGER NOT NULL,
    FOREIGN KEY (userID) REFERENCES Users (userID) ON DELETE CASCADE,
    FOREIGN KEY (projectID) REFERENCES Projects (projectID) ON DELETE CASCADE
);`);

// Create the Pend_Course_Users join table
db.run(`CREATE TABLE IF NOT EXISTS Pend_Course_Users(
    userID INTEGER NOT NULL,
    courseID INTEGER NOT NULL,
    FOREIGN KEY (userID) REFERENCES Users (userID) ON DELETE CASCADE,
    FOREIGN KEY (courseID) REFERENCES Courses (courseID) ON DELETE CASCADE
);`);

db.close();  // Close the connection because it doesn't need to be persistent for the creation of the DB