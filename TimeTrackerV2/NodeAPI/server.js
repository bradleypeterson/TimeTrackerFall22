const cors = require("cors");
const express = require("express");
const https = require("https");
const path = require("path");
const fs = require("fs");
const ConnectToDB = require("./database/DBConnection");
const ConnectToAudit = require("./database/create_audit.js");
const session = require("express-session");
const crypto = require("crypto");

require("./database/seed.js"); //this runs the file seed.js to make the database if it doesn't exist


const ExternalRoutes = require("./routes/routes"); //include our "routes.js" module so we can use it inside this file.  Module documentation https://www.w3schools.com/nodejs/nodejs_modules.asp

// Constants
const PORT = 8080;

// Database
let db = ConnectToDB();
let al = ConnectToAudit();

// App
const app = express();
const hostname = "137.190.19.215"

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(
  express.json({
    extended: false,
  })
);

app.get("/", (req, res) => {
  return res.send("Hello World");
});

// Remember authenticated users between API requests.
// This in-memory session setup is for local development.
app.use(session({
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // Local website uses http://localhost.
      maxAge: 60 * 60 * 1000
  }
}));

// using our routes we defined inside our "routes.js" file
app.use("/api", ExternalRoutes); //adds our custom http responses from the file specified for "ExternalRoutes"


const sslServer = https.createServer(
  {
    key: fs.readFileSync(path.join(__dirname, "certificates/key.key")), // __dirname = current directory.  And then grab the file key.pem located in the certificates folder
    cert: fs.readFileSync(path.join(__dirname, "certificates/cert.crt")),
  },
  app
);

sslServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Running on https://137.190.19.215:${PORT}`);
  if (db) {
    console.log("Connected to the main database.");
  }
  if (al){
    console.log("Connected to Audit Log")
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack); // Log error details
  res.status(500).send('There was an Error');
})
