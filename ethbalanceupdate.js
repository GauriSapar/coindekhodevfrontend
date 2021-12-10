var express = require('express'),
    cors = require('cors'),
    app = express();
var bodyParser = require('body-parser');
const moment = require('moment-timezone');


var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
  
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


app.use(cors());


// const url = "mongodb://root:ZuyXXoKoxjo6@172.31.2.103:27017/coindekhodev";
// const url = "mongodb://root:Dc0gFRR5zrmn@172.31.43.21:27017/coindekhodev";
const url = "mongodb://root:JULjAhfxiuh9@172.31.15.66:27017/coindekhodev";

app.get('/', function(req, res) {
	
	
    res.send("This API server is developed for BITCOIN");
})

app.post('/ethaddtest2', function(req, resMain) {
    let apidata = req.body

    // console.log("status",apidata)
    console.log("status",apidata.status)
    console.log("hash",apidata.hash)
    console.log("to",apidata.to)
    console.log("value",apidata.value)
    console.log("direction",apidata.direction)
    console.log("watchedAddress",apidata.watchedAddress)
    console.log("asset",apidata.asset)

    if(apidata.contractCall) {
        console.log("ERC20")
        console.log("methodName",apidata.contractCall.methodName)
        console.log("_value",apidata.contractCall.params._value)
    }
    console.log("-----")

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
            if(apidata.asset == "RBC") {
                decimals = 18;
            }
            amountget = Number(apidata.contractCall.params._value/(10**decimals));
        }
    } else {
        amountget = Number(apidata.value/(10**18)); 
    } 
    

    console.log(req.body)
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
        
                            await dbo.collection("UserBalance").findOneAndUpdate(myqueryUser, { $set: {[coinName] : Number(finalBalance)} }, function (err3, res3) {
        
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



app.listen(3002, function() {
    console.log('app running on port : 3002');
});
