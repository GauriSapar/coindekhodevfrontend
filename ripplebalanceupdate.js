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


// const url = "mongodb://root:Dc0gFRR5zrmn@172.31.43.21:27017/coindekhodev";
const url = "mongodb://root:JULjAhfxiuh9@172.31.15.66:27017/coindekhodev";

app.get('/', function(req, res) {
	
	
    res.send("This API server is developed for BITCOIN");
})

app.post('/xrpaddtest2', function(req, resMain) {
    let apidata = req.body

    console.log("status",apidata)

    console.log("type",apidata.type)
    console.log("transaction",apidata.transaction.hash)
    console.log("TransactionType",apidata.transaction.TransactionType)
    console.log("Destination",apidata.transaction.Destination)
    console.log("Amount",(apidata.transaction.Amount/(10**6))) 

    console.log("-----")

})

app.post('/xrpaddtest', function(req, resMain) {
    let apidata = req.body
    let coinName = "XRP"
    let amountget = 0
    let decimals = 18
    let extratag = apidata.transaction.DestinationTag

    console.log("status",apidata)

    if(apidata.type == "transaction" && apidata.transaction.TransactionType == "Payment") {

    amountget = Number(apidata.transaction.Amount/(10**6)); 
    

    var date = moment();
        date = date.tz("Asia/Calcutta").format("YYYY-MM-DD HH:mm:ss A")
	MongoClient.connect(url, async function (err, db) {
        // if (err) throw err;
        var dbo = db.db("coindekhodev");
        dbo.collection(""+coinName).findOne({walletAddress:apidata.transaction.Destination,extratag:extratag}, async function (err, result) {
            
            if(result) {
                console.log("result",result.userId)
                var myqueryUser = { userId: new mongo.ObjectID(result.userId) }

                await dbo.collection("Deposite").findOne({txid:apidata.transaction.hash}, async function (err4, res4) {
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
                                "walletAddress" : apidata.transaction.Destination, 
                                "extratag": extratag,
                                "txid": apidata.transaction.hash,
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
                                                "statusCode": 400,
                                                "message": "error"
                                            })
                                        }
                                    } else {
                                        resMain.send({
                                            "statusCode": 400,
                                            "message": "error"
                                        })
                                    }
                            })
        
                        })
                    } else {
                        resMain.send({
                            "statusCode": 400,
                            "message": "alreadyTxExist"
                        })
                    }
                })
                

            } else {
                resMain.send({
                    "statusCode": 400,
                    "message": "error"
                })
            }

        })

                
    })

    }
	
    
})



app.listen(3005, function() {
    console.log('app running on port : 3005');
});
