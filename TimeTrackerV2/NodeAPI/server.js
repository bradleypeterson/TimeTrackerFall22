const cors = require('cors'); 
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
require('./database/seed.js'); //this runs the file seed.js to make the database if it doesn't exist

const ExternalRoutes = require("./routes/routes")  //include our "routes.js" module so we can use it inside this file.  Module documentation https://www.w3schools.com/nodejs/nodejs_modules.asp

// Constants
const PORT = 8080;

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

app.listen(PORT, () => 
  console.log(`Running on http://localhost:${PORT}`)
);
