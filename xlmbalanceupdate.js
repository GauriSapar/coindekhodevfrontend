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
    key: fs.readFileSync('server-key.pem'),
    cert: fs.readFileSync('server-crt.pem')
}; 

const PORT = process.env.PORT || 2083;
var server = https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`Server is running at PORT http://localhost:${PORT}`);
});

var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server('https://horizon.stellar.org');



const url = "mongodb://root:ZuyXXoKoxjo6@172.31.2.103:27017/coindekhodev";

app.get('/', function(req, res) {
	
	
    res.send("This API server is developed for BITCOIN");
})

app.post('/xlmadd', async function(req, resMain) {
    let apidata = req.body
let mainWallet = "GACUZPEHVQL5R42TQSQ5R4BQVHHMEZ26AGH6VHWC6CQMGYU3KZ23OCDK"
var options = {
    method: 'GET',
    url: 'https://horizon.stellar.org/accounts/'+mainWallet+'/transactions?limit=5&order=desc'
}; 


var date = moment();
    date = date.tz("Asia/Calcutta").format("YYYY-MM-DD HH:mm:ss A")
    MongoClient.connect(url, async function (err, db) {
    // if (err) throw err;
    var dbo = db.db("Bithind_Server");

            await request(options, async function (error, response) {

                // console.log(response.body)
            
                let jsonResponse = JSON.parse(response.body)._embedded.records
            //  console.log(JSON.parse(response.body)._embedded.records)

                await Promise.all(jsonResponse.map(async row => {
                    console.log("memo",row.memo);
                    console.log("hash",row.hash);
                    console.log("successful",row.successful);

                    if(row.successful == true) {
                    await dbo.collection("bithindXLM").findOne({walletAddress:mainWallet,extratag:Number(row.memo)}, async function (err, result) {
            
                        if(result) {

                            var myqueryUser = { userId: new mongo.ObjectID(result.userId) }
                            await dbo.collection("bithindDeposite").findOne({userId:result.userId,txid:row.hash}, async function (err4, res4) {
                                // console.log("found",res4)
                                if(res4 == null) {

                                    var optionsinternal = {
                                        method: 'GET',
                                        url: 'https://horizon.stellar.org/transactions/'+row.hash+'/operations?limit=1&order=desc'
                                    }; 
                                    await request(optionsinternal, async function (errorInt, responseInt) {
                                        let jsonResponseInt = JSON.parse(responseInt.body)._embedded.records[0]
                                        
                                            console.log("transaction_successful",jsonResponseInt.transaction_successful);
                                            console.log("type",jsonResponseInt.type);
                                            console.log("transaction_hash",jsonResponseInt.transaction_hash);
                                            console.log("asset_type",jsonResponseInt.asset_type);
                                            console.log("to",jsonResponseInt.to);
                                            console.log("amount",jsonResponseInt.amount);

                                            await dbo.collection("bithindUserBalance").findOne(myqueryUser, async function (err2, res2) {
                                                var currentBalance = Number(res2["XLM"])
                                                var tobeAddedBalance = Number(jsonResponseInt.amount)
                                                var finalBalance = Number(currentBalance + tobeAddedBalance).toFixed(8)
                                                // console.log(finalBalance)
                            
                                                await dbo.collection("bithindUserBalance").findOneAndUpdate(myqueryUser, { $set: {XLM : finalBalance} }, function (err3, res3) {
                            
                                                })
                                                let insertData = {
                                                    "userId" : result.userId, 
                                                    "coinName" : "XLM", 
                                                    "amount" : tobeAddedBalance, 
                                                    "walletAddress" : mainWallet, 
                                                    "txid": row.hash,
                                                    "fees" : 0, 
                                                    "date" : date, 
                                                    "status" : "Completed", 
                                                    "isDeleted" : false, 
                                                }
                                                await dbo.collection("bithindDeposite").insertOne(insertData, function (err4, res4) {
                                                })
                            
                                            })
                                        
                                    })
                                    console.log("----");

                                }
                            })

                        }
                    })
                    }
                    
                }))

            
            })

    // MongoEND
    })

            //     var options = {
            //         method: 'GET',
            //         url: 'https://horizon.stellar.org/accounts/GA6SXIZIKLJHCZI2KEOBEUUOFMM4JUPPM2UTWX6STAWT25JWIEUFIMFF/operations?limit=2&order=desc'
            //     }; 


            // await request(options, async function (error, response) {
            //     let jsonResponse = JSON.parse(response.body)._embedded.records
            // //  console.log(JSON.parse(response.body)._embedded.records)

            // jsonResponse.map(row => {
            //     console.log("transaction_successful",row.transaction_successful);
            //     console.log("type",row.type);
            //     console.log("transaction_hash",row.transaction_hash);
            //     console.log("asset_type",row.asset_type);
            //     console.log("to",row.to);
            //     console.log("amount",row.amount);
            // })


            // })

            await resMain.send({
                "statusCode": 200,
                "message" : "success"
            })

})
app.post('/trxadd', function(req, resMain) {
    let apidata = req.body


    var date = moment();
    date = date.tz("Asia/Calcutta").format("YYYY-MM-DD HH:mm:ss A")
    MongoClient.connect(url, async function (err, db) {
    // if (err) throw err;
    var dbo = db.db("Bithind_Server");

    var options = {
        method: 'GET',
        url: 'https://api.trongrid.io/v1/accounts/'+apidata.walletAddress+'/transactions',
        qs: {only_confirmed: 'true', only_to: 'true', limit: '7', search_internal: 'false'}
      };
      
      dbo.collection("bithindTRX").findOne({walletAddress:apidata.walletAddress}, async function (err, result) {
            
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


                        await dbo.collection("bithindDeposite").findOne({txid:row.txID}, async function (err4, res4) {
                            // console.log("found",res4)
                            if(res4 == null) {
                                await dbo.collection("bithindUserBalance").findOne(myqueryUser, async function (err2, res2) {
                                    var currentBalance = Number(res2["TRX"])
                                    var tobeAddedBalance = Number(row.raw_data.contract[0].parameter.value.amount/(10**6))
                                    var finalBalance = Number(currentBalance + tobeAddedBalance).toFixed(8)
                                    // console.log(finalBalance)
                
                                    await dbo.collection("bithindUserBalance").findOneAndUpdate(myqueryUser, { $set: {TRX : finalBalance} }, function (err3, res3) {
                
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
                                    await dbo.collection("bithindDeposite").insertOne(insertData, function (err4, res4) {
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




// app.listen(3006, function() {
//     console.log('app running on port : 3006'); 
// });
