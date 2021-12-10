const express = require("express");
const bodyParser = require("body-parser");
const http = require('http');
var log4js = require('log4js');

var logger = log4js.getLogger();

var cors = require('cors');
const app = express();
var https = require('https');
var fs = require('fs');
const rateLimit = require("express-rate-limit");
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize'); 
const xss = require('xss-clean');
var MongoClient = require('mongodb').MongoClient; 

//database connection path
//const url = "mongodb://root:JULjAhfxiuh9@172.31.15.66:27017/admin";
const url = "mongodb://localhost:27017/coindekhodev";


// const port = normalizePort(process.env.PORT || '5000');
// const server = http.createServer(app);

let date = new Date();
// console.log(date); 

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 100 requests per windowMs  
  message: 'Too many requests' // message to send
}); 
  
//  apply to all requests
app.enable('trust proxy');
app.use(limiter);
app.use(xss());
app.use(helmet());
app.use(mongoSanitize());
app.use(cors());

// var httpsOptions = { 
//     key: fs.readFileSync('server-key.pem'),
//     cert: fs.readFileSync('server-crt.pem')
// };

const PORT = process.env.PORT || 2087; 
// var server = https.createServer(httpsOptions, app).listen(PORT, () => {
//     console.log(`Server is running at PORT http://localhost:${PORT}`);
// });

var server = http.createServer(app).listen(PORT, () => {
  console.log(`Server is running at PORT http://localhost:${PORT}`);
});

app.options('*', cors());

app.use((req, res, next) => {
  var allowedOrigins = [
    // "bithind.com",
    // "www.bithind.com", 
  ];
  var origin = req.headers.origin;
  console.log(origin)
  console.log(allowedOrigins.indexOf(origin) > -1)
  // Website you wish to allow to
  if (allowedOrigins.indexOf(origin) > -1) {
//    res.setHeader("Access-Control-Allow-Origin", origin);
res.setHeader("Access-Control-Allow-Origin", "*");
  }

  // res.header("Access-Control-Allow-Origin", "*, https://sendgrid.api-docs.io");, 13.233.155.182:3000
  // res.header("Access-Control-Allow-Origin", "http://13.233.155.182:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Authorization, Content-Type, Accept, x-access-token");
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
}); 

app.use(express.json({ limit: '10kb' })); // Body limit is 10

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json({ limit: '10mb', extended: true }))

// define a simple route
app.get('/', (req, res) => {
  res.json({ "appName": "Exchange", "version": "1.0.0" });
});

//set port to listen on given port number 
// app.set('port', port);

// app.listen(port, function () {
//   console.log('Express server listening on port ' + port);
// });
MongoClient.connect(url, async function (err, db) { 
require('./routes')(app, url);
})

app.get('/success', (req, res) => res.send("Welcome " + req.query.username + "!!"));
app.get('/error', (req, res) => res.send("error logging in"));

logger.level = 'debug';
logger.debug("Some debug messages");


/**
 * Normalize a port into a number, string, or false.
 * @param {*} val 
 */
function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}


// function checkDirectorySync(directory) {  
//   try {
//     fs.statSync(directory);
//   } catch(e) {
//     fs.mkdirSync(directory);
//   }
// }

// checkDirectorySync("./UserEmail");   