const cors = require("cors");
const express = require("express");
const https = require("https");
const path = require("path");
const fs = require("fs");
const ConnectToDB = require("./database/DBConnection");

require("./database/seed.js"); //this runs the file seed.js to make the database if it doesn't exist

const ExternalRoutes = require("./routes/routes"); //include our "routes.js" module so we can use it inside this file.  Module documentation https://www.w3schools.com/nodejs/nodejs_modules.asp

// Constants
const PORT = 8080;

// Database
let db = ConnectToDB();

// App
const app = express();
app.use(
  cors({
    //origin: "https://137.190.19.220:4200", // allows the supplied url to talk to the server
    origin: "https://localhost:4200",
    credentials: true, // Allows credentials from the origin
  })
);
app.use(
  express.json({
    extended: false,
  })
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Methods", "DELETE, PUT, GET, POST");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  return res.send("Hello World");
});

// using our routes we defined inside our "routes.js" file
app.use("/api", ExternalRoutes); //adds our custom http responses from the file specified for "ExternalRoutes"

// We are using the readFileSync() because this information is vital for the server.  I.E. without these certificates, the server should not be started
const sslServer = https.createServer(
  {
    key: fs.readFileSync(path.join(__dirname, "certificates/key.key")), // __dirname = current directory.  And then grab the file key.pem located in the certificates folder
    cert: fs.readFileSync(path.join(__dirname, "certificates/cert.crt")),
  },
  app
);

sslServer.listen(PORT, () => {
  console.log(`Running on https://137.190.19.220:${PORT}`);
  if (db) {
    console.log("Connected to the main database.");
  }
});
