const express = require('express');
var fs = require('fs');
var cors = require('cors');
const {
    ObjectID
} = require('mongodb');
var dateFormat = require('dateformat');
const app = express();
var http = require('http');
var https = require('https');
var port = process.env.PORT || 3010;
log = console.log;

// var server = https.createServer({
//     key: fs.readFileSync('server.key'),
//     cert: fs.readFileSync('server.cert')
//   },app, cors())
//       .listen(port, function() {
//           console.log('Example app listening on port ' + port);
//       })
app.options('*', cors()); 
var server = http.createServer(app).listen(port, () => {
    console.log(`Server is running at PORT http://localhost:${port}`);
  });

// var server = https.createServer({
//   key: fs.readFileSync('server.key'),
//   cert: fs.readFileSync('server.cert')
// },app)
//     .listen(port, function() {
//         console.log('Example app listening on port ' + port);
//     })
    

client = require('socket.io')(server);
// io.set('origins', 'http://65.1.138.3:3000');

client.on('connection', function(socket) {
    client.emit('Ruby Exchange Connected');
    console.log('a user connected');
});

app.get('/', (req, res) => {
    res.status(200).send({
        success: 'true'
    })
})
app.get('/buyorder-wsko5Ud63EFVAOeVAAAO', (req, res) => {
    var orderdetails = {}
    orderdetails['id'] = req.query.id;
    orderdetails['ordertype'] = req.query.ordertype;
    orderdetails['coin'] = req.query.coin;
    orderdetails['pair'] = req.query.pair;
    orderdetails['amt'] = req.query.amt;
    orderdetails['price'] = req.query.price;
    orderdetails['total'] = req.query.total;
    orderdetails['event'] = req.query.event;
    orderdetails['WSclientId'] = req.query.WSclientIdBuy;
    var output = {}
    output['channelName'] = "TRADE";
    output['data'] = [orderdetails];
    client.on('connect', function(socket) {});
    client.on('connection', function(socket) {});
    client.emit('TRADE', orderdetails);
    res.status(200).send({
        success: 'true'
    })
});
app.get('/sellorder-1bpKGzjYyfvGTuA3AAAP', (req, res) => {
    var orderdetails = {}
    orderdetails['id'] = req.query.id;
    orderdetails['ordertype'] = req.query.ordertype;
    orderdetails['coin'] = req.query.coin;
    orderdetails['pair'] = req.query.pair;
    orderdetails['amt'] = req.query.amt;
    orderdetails['price'] = req.query.price;
    orderdetails['total'] = req.query.total;
    orderdetails['event'] = req.query.event;
    orderdetails['WSclientId'] = req.query.WSclientIdSell;
    var output = {}
    output['channelName'] = "TRADE";
    output['data'] = [orderdetails];
    client.on('connect', function(socket) {});
    client.on('connection', function(socket) {});
    client.emit('TRADE', orderdetails);
    res.status(200).send({
        success: 'true'
    })
});
app.get('/botorder-1bpKGzjYyfvGTuA3AAAP', (req, res) => {
    var orderdetails = {}
    var ticketdetails = {}
    orderdetails['id'] = req.query.id;
    orderdetails['ordertype'] = req.query.ordertype;
    orderdetails['coin'] = req.query.coin;
    orderdetails['pair'] = req.query.pair;
    orderdetails['amt'] = req.query.amt;
    orderdetails['price'] = req.query.price;
    orderdetails['total'] = req.query.total;
    orderdetails['event'] = req.query.event;
    orderdetails['WSclientId'] = req.query.WSclientIdSell;
    ticketdetails['ordertype'] = req.query.ordertype;
    ticketdetails['coin'] = req.query.coin;
    ticketdetails['pair'] = req.query.pair;
    ticketdetails['amt'] = req.query.amt;
    ticketdetails['price'] = req.query.price;
    ticketdetails['total'] = req.query.total;
    var output = {}
    output['channelName'] = "TRADE";
    output['data'] = [orderdetails];
    client.on('connect', function(socket) {});
    client.on('connection', function(socket) {});
    client.emit('TRADE', orderdetails);
    client.emit('TICKER', ticketdetails);
    res.status(200).send({
        success: 'true'
    })
});