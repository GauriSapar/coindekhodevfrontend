var express = require('express'),
    cors = require('cors'),
    app = express();
var https = require('https');
var fs = require('fs');
var bodyParser = require('body-parser');
const moment = require('moment-timezone');

var request = require("request");


var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
  
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


app.use(cors());

var httpsOptions = { 
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
};

const PORT = process.env.PORT || 2053;
var server = https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`Server is running at PORT http://localhost:${PORT}`);
});

const TronWeb = require('tronweb');
// const fetch = require('node-fetch');

const HttpProvider = TronWeb.providers.HttpProvider; // Optional provider, can just use a url for the nodes instead

const fullNode = new HttpProvider('https://api.trongrid.io:8090'); // Full node http endpoint
    
const solidityNode = new HttpProvider('https://api.trongrid.io:8091'); // Solidity node http endpoint
    
const eventServer = 'https://api.trongrid.io/'; // Contract events http endpoint
const privateKey = 'da146374a75310b9666e834ee4a...c76217c5a495fff9f0d0';

const tronWeb = new TronWeb(
  fullNode,
  eventServer
); 

const url = "mongodb://root:JULjAhfxiuh9@172.31.15.66:27017/coindekhodev";

app.get('/', function(req, res) {
	
	
    res.send("This API server is developed for BITCOIN");
})

app.post('/trxadd', function(req, resMain) {
    let apidata = req.body


    var date = moment();
    date = date.tz("Asia/Calcutta").format("YYYY-MM-DD HH:mm:ss A")
    MongoClient.connect(url, async function (err, db) {
    // if (err) throw err;
    var dbo = db.db("coindekhodev");

    var options = {
        method: 'GET',
        url: 'https://api.trongrid.io/v1/accounts/'+apidata.walletAddress+'/transactions',
        qs: {only_confirmed: 'true', only_to: 'true', limit: '20', search_internal: 'false'}
      };
      
      dbo.collection("TRX").findOne({walletAddress:apidata.walletAddress}, async function (err, result) {
            
        if(result) {

            var myqueryUser = { userId: new mongo.ObjectID(result.userId) }

            await request(options, async function (error, response) {
                if (error) throw new Error(error);
                let jsonResponse = JSON.parse(response.body).data

                await Promise.all( jsonResponse.map( async row => {
                    console.log("txID",row.txID);
                    // console.log("contract",row.raw_data.contract);
                    console.log("type",row.raw_data.contract[0].type);
                    console.log("value",Number(row.raw_data.contract[0].parameter.value.amount/(10**6)));  

                    if(row.raw_data.contract[0].type == "TransferContract") { 


                        await dbo.collection("Deposite").findOne({txid:row.txID}, async function (err4, res4) {
                            // console.log("found",res4)
                            if(res4 == null) {
                                await dbo.collection("UserBalance").findOne(myqueryUser, async function (err2, res2) {
                                    var currentBalance = Number(res2["TRX"])
                                    var tobeAddedBalance = Number(row.raw_data.contract[0].parameter.value.amount/(10**6))
                                    var finalBalance = Number(currentBalance + tobeAddedBalance).toFixed(8)
                                    // console.log(finalBalance)
                
                                    await dbo.collection("UserBalance").findOneAndUpdate(myqueryUser, { $set: {TRX : Number(finalBalance)} }, function (err3, res3) {
                
                                    })
                                    let insertData = {
                                        "userId" : result.userId, 
                                        "coinName" : "TRX", 
                                        "amount" : tobeAddedBalance, 
                                        "walletAddress" : apidata.walletAddress, 
                                        "txid": row.txID,
                                        "fees" : 0, 
                                        "date" : date, 
                                        "status" : "Completed", 
                                        "isDeleted" : false, 
                                    }
                                    await dbo.collection("Deposite").insertOne(insertData, function (err4, res4) {
                                        // console.log(res4)
                                            // if (!err4) {
                                            //     if (res4.value !== null) {
                                            //         resMain.send({
                                            //             "statusCode": 200,
                                            //             "message": "success"
                                            //         })
                                            //     } else {
                                            //         resMain.send({
                                            //             "statusCode": 200,
                                            //             "message": "error"
                                            //         })
                                            //     }
                                            // } else {
                                            //     resMain.send({
                                            //         "statusCode": 200,
                                            //         "message": "error"
                                            //     })
                                            // }
                                    })
                
                                })
                            }
                        })

                    }
                    // console.log("body",row);
                })
                )
                
                await resMain.send({
                    "statusCode": 200,
                    "message" : "success"
                })
            })

        } else {
            resMain.send({
                "statusCode": 200,
                "message" : "error"
            })
        }
        
      });
    })


})

app.post('/ethadd', function(req, resMain) {
    let apidata = req.body
    let coinName = apidata.asset
    let amountget = 0
    let decimals = 18
    if(apidata.status == "confirmed" && apidata.direction == "incoming") {

    if(apidata.contractCall) {
        if(apidata.contractCall.methodName == "transfer") {
            if(apidata.asset == "USDT") {
                decimals = 6;
            }
            if(apidata.asset == "DLTX") {
                decimals = 18;
            }
            amountget = Number(apidata.contractCall.params._value/(10**decimals));
        }
    } else {
        amountget = Number(apidata.value/(10**18)); 
    } 
    

    // console.log(req.body)
    var date = moment();
        date = date.tz("Asia/Calcutta").format("YYYY-MM-DD HH:mm:ss A")
	MongoClient.connect(url, async function (err, db) {
        // if (err) throw err;
        var dbo = db.db("coindekhodev");
        dbo.collection(""+coinName).findOne({walletAddress:(apidata.watchedAddress).toLowerCase()}, async function (err, result) {
            
            if(result) {
                console.log("result",result.userId)
                var myqueryUser = { userId: new mongo.ObjectID(result.userId) }

                await dbo.collection("Deposite").findOne({txid:apidata.hash}, async function (err4, res4) {
                    // console.log("found",res4)
                    if(res4 == null) {
                        await dbo.collection("UserBalance").findOne(myqueryUser, async function (err2, res2) {
                            var currentBalance = Number(res2[coinName])
                            var tobeAddedBalance = Number(amountget)
                            var finalBalance = Number(currentBalance + tobeAddedBalance).toFixed(8)
                            // console.log(finalBalance)
        
                            await dbo.collection("UserBalance").findOneAndUpdate(myqueryUser, { $set: {[coinName] : finalBalance} }, function (err3, res3) {
        
                            })
                            let insertData = {
                                "userId" : result.userId, 
                                "coinName" : coinName, 
                                "amount" : tobeAddedBalance, 
                                "walletAddress" : (apidata.watchedAddress).toLowerCase(), 
                                "txid": apidata.hash,
                                "fees" : 0, 
                                "date" : date, 
                                "status" : "Completed", 
                                "isDeleted" : false, 
                            }
                            await dbo.collection("Deposite").insertOne(insertData, function (err4, res4) {
                                // console.log(res4)
                                    if (!err4) {
                                        if (res4.value !== null) {
                                            resMain.send({
                                                "statusCode": 200,
                                                "message": "success"
                                            })
                                        } else {
                                            resMain.send({
                                                "statusCode": 200,
                                                "message": "error"
                                            })
                                        }
                                    } else {
                                        resMain.send({
                                            "statusCode": 200,
                                            "message": "error"
                                        })
                                    }
                            })
        
                        })
                    } else {
                        resMain.send({
                            "statusCode": 200,
                            "message": "alreadyTxExist"
                        })
                    }
                })
                

            } else {
                resMain.send({
                    "statusCode": 200,
                    "message": "error"
                })
            }

        })

                
    })

    }else {
        resMain.send({
            "statusCode": 200,
            "message": "success"
        })
    }
	
    
})



// app.listen(2053, function() {
//     console.log('app running on port : 2053');  
// });
