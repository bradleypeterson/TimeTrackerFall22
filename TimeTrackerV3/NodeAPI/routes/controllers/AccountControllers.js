// require("dotenv").config();
// const JWT_SECRET = process.env.JWT_SECRET;

var localStorage = require('node-localstorage').LocalStorage;
const crypto = require('crypto');
const ConnectToDB = require('../../Database/DBConnection');
const insertAudit = require('./AuditLog')
let db = ConnectToDB();
localStorage = new localStorage('./scratch');
const DummyData = require('../../Database/DummyData');

exports.Register = async (req, res, next) => {
  console.log("AccountControllers.js file/Register route called");

  // added isApproved
  let username = req.body["username"];
  let firstName = req.body["firstName"];
  let lastName = req.body["lastName"];
  let type = req.body["type"];
  let isApproved = req.body["isApproved"];
  let password = req.body["password"];
  let salt = req.body["salt"];

  // Validate user doesn't already exist (can be handled by the unique constraint, but this is left in so we have more control without having to determine what cause the error)
  let sql = `SELECT *
		FROM Users
		WHERE username = ?`;

  db.get(sql, [username], (err, rows) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Something went wrong. Please try again later." });
    }

    if (rows) {
      return res
        .status(400)
        .json({ message: "A user of this name already exists" });
    }

    // added isApproved
    let sql = `INSERT INTO Users(username, password, firstName, lastName, type, isApproved, isActive, salt)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;

        // Can't use dictionaries for queries so order matters!
        // added isApproved
        let data = [];
        data[0] = username;
        data[1] = password;
        data[2] = firstName;
        data[3] = lastName;
        data[4] = type;
        data[5] = isApproved;
        data[6] = true; //isActive
        data[7] = salt;

        db.run(sql, data, function (err, rows) {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: 'Something went wrong in creating the account. Please try again later.' });
            } else {
                const userID = this.lastID;
                insertAudit(userID, 'CREATE_USER', `${type}: ${username} created`)
                return res.status(200).json({ message: 'User registered' });
            }
        });
    });
}

//Function for registering many accounts at once (used for generating dummy data into DB)
exports.BulkRegister = async (req, res, next) => {
    
    console.log("AccountControllers.js file/BulkRegister route called");

    var Dummies = Object.values(DummyData);

    db.serialize(() => {
        db.run(`BEGIN TRANSACTION`);

        // SQL queries
        const SqlUserExists = `SELECT COUNT(*) as count FROM Users WHERE username=?`;

        const SqlInsertUser = `INSERT INTO Users(username, password, firstName, lastName, type, isApproved, isActive, salt)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;

        // Loop through dummy data
        for (let i = 0; i < Dummies[0].length; i++) {
            let username = Dummies[0][i][0];
            let data = [];
            data[0] = Dummies[0][i][0];                //username
            data[1] = req.body[i][0];                       //password
            data[2] = Dummies[0][i][1];                //firstname
            data[3] = Dummies[0][i][2];                //lastname
            data[4] = Dummies[0][i][3];                //type
            data[5] = true;                                 //isApproved
            data[6] = true;                                 //isActive
            data[7] = req.body[i][1];                       //Salt

        
            db.get(SqlUserExists, [username] , (err, row) => {
                if (err) {
                    console.log(err);
                }

                // If the user does not exist, insert the user
                if (row.count>0) {
                    console.log("A user with this name already exists")
                } else {
                    db.run(SqlInsertUser, data, function(err) {
                        if (err) {
                            console.log(err);
                        }
                        
                    });
                }
            });//end db.get()
        }
    
        // Commit
        db.run(`COMMIT`, (err) => {
            if (err) {
                console.error("Error committing transaction:", err);
                db.run(`ROLLBACK`);
            } else {
                console.log('Dummy Data inserted successfully.');
            }
        });
    });
    
}

exports.GrabSaltForUser = (req, res) => {
  console.log("AccountControllers.js file/GrabSaltForUsername route called");

  let username = req.params["username"];
  console.log(`Searching for user with the username of "${username}"`);

  let sql = `SELECT salt
    FROM Users
    WHERE username = ?`;

  db.get(sql, [username], (err, row) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Something went wrong. Please try again later." });
    }
    if (row) {
      console.log("Salt found, returning it back to client");
      res.send(JSON.stringify(row["salt"]));
    } else {
      console.log("No user with that username, unable to grab a salt value");
      return res
        .status(401)
        .json({ message: "Username or password is incorrect." });
    }
  });
};

exports.Login = async (req, res, next) => {
  console.log("AccountControllers.js file/Login route called");

  let username = req.body["username"];
  let password = req.body["password"];
  console.log(`username: ${username} password: ${password}`);

  let sql = `SELECT *
		FROM Users
		WHERE username = ?`;

  db.get(sql, [username], (err, rows) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Something went wrong. Please try again later." });
    }
    if (rows) {
      // If the passwords match and the user is active
      // added isApproved
      if (
        rows["password"] === password &&
        rows["isApproved"] === 1 &&
        rows["isActive"] === 1
      ) {
        const safeUserData = { ...rows, password: undefined, salt: undefined };

        // const token = JWT_SECRET.sign({})

        // we use 1 as true because the DB uses 1 as true and 0 as false
        console.log("User authenticated");
        return res.status(200).json({ user: safeUserData });
      }
      // If the passwords do not match
      else if (rows["password"] !== password) {
        console.log("Wrong Password");
        return res
          .status(401)
          .json({ message: "Username or password is incorrect." });
      }
      // The account hasn't been admin approved yet (instructors only)
      else if (rows["isApproved"] != 1) {
        console.log("User awaiting admin approval");
        return res
          .status(403)
          .json({ message: "Account awaiting admin approval." });
      }
      // The account has been disabled
      else {
        console.log("User not active");
        return res.status(403).json({ message: "Account has been disabled." });
      }
    } else {
      console.log("No user with that username");
      return res
        .status(401)
        .json({ message: "Username or password is incorrect." });
    }
  });
};

exports.DeleteAccount = async (req, res, next) => {
  console.log("AccountControllers.js file/DeleteAccount route called");

  let userID = req.body.userID;
  console.log("userID: " + userID);

    let sqlGetUser = `SELECT username, type FROM Users WHERE userID = ?`;

    db.get(sqlGetUser, [userID], (err, row) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Something went wrong while fetching user details. Please try again later.' });
        }

        if (!row) {
            return res.status(404).json({ message: 'User not found.' });
        }

        let { username, type } = row;

        let sql = `DELETE
        FROM Users
        WHERE userID = ?`;

        db.run(sql, [userID], (err, value) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
            }
            else {
                insertAudit(req.body.currentUserID, 'DELETE_USER', `${type}: ${username}: ${userID} deleted`)
                return res.status(200).json({ message: 'The account has been deleted.' });
            }
        });
    });
}

exports.DefaultAdminAccountCreated = async (req, res, next) => {
  console.log(
    "AccountControllers.js file/DefaultAdminAccountCreated route called"
  );

  // The below variable is set in the seed.js file and if it is true, then the default admin account has been generated.
  let CreatedOrEnabled =
    JSON.parse(
      localStorage.getItem("defaultAdminCreatedOrEnabledAndNotViewed")
    ) === true;

  console.log(`defaultAdminCreatedOrEnabledAndNotViewed: ${CreatedOrEnabled}`);

  if (CreatedOrEnabled) {
    res.send(true);
    localStorage.setItem("defaultAdminCreatedOrEnabledAndNotViewed", false); //this will make it so that only the first person that uses this API call will see the message.
  } else {
    res.send(false);
  }
};

exports.ChangePassword = (req, res) => {
  console.log("AccountControllers.js file/ChangePassword route called");

  let userID = req.params["userID"];
  console.log(JSON.stringify(req.body));
  let password = req.body.password;
  let salt = req.body.salt;

  let sql = `UPDATE Users
    SET password = ?, salt = ?
    WHERE userID = ?`;

  db.run(sql, [password, salt, userID], (err, value) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message:
          "Something went wrong in resetting the user's password.\nPlease try again later.",
      });
    } else {
      return res
        .status(200)
        .json({ message: "The user's password has been changed." });
    }
  });
};

exports.UpdateUserInfo = (req, res) => {
  console.log("AccountControllers.js file/UpdateAccountInfo route called");

  //"firstName":"sudo","lastName":"admin","type":"admin","isActive":0
  let userID = req.body["userID"];
  let username = req.body["username"];
  let firstName = req.body["firstName"];
  let lastName = req.body["lastName"];
  let type = req.body["type"];
  let isApproved = req.body["isApproved"];
  let isActive = req.body["isActive"];

  // added isApproved
  let data = [];
  data[0] = username;
  data[1] = firstName;
  data[2] = lastName;
  data[3] = type;
  data[4] = isApproved;
  data[5] = isActive;
  data[6] = userID;

  // added isApproved
  let sql = `UPDATE Users
    SET username = ?, firstName = ?, lastName = ?, type = ?, isApproved = ?, isActive = ?
    WHERE userID = ?`;

  db.run(sql, data, (err, value) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message:
          "Something went wrong in saving the changes for the user.\nPlease try again later.",
      });
    } else {
      return res
        .status(200)
        .json({ message: "The changes to the user has been saved." });
    }
  });
};

// isAppproved added for all relevant statements
