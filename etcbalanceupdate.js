var express = require('express'),
    cors = require('cors'),
    app = express();
var bodyParser = require('body-parser');
const moment = require('moment-timezone');


const axios = require('axios')

var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
  
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


app.use(cors());


const url = "mongodb://root:ZuyXXoKoxjo6@3.6.222.121:27017/coindekhodev";

app.get('/', function(req, res) {
	
	
    res.send("This API server is developed for BITCOIN");
})

app.post('/etcaddtest2', function(req, resMain) {
    let apidata = req.body
 
    console.log("status",apidata)
    console.log("address",apidata.address)
    console.log("currency",apidata.currency)
    console.log("network",apidata.network)


})

app.post('/etcaddtest', async function(req, resMain) {
    let apidata = req.body
    console.log("apidata",apidata)
    let amountget = 0
    let decimals = 18
    if(apidata.currency == "ETC" && apidata.network == "mainnet" && apidata.type == "ADDRESS") {


        await axios({
            method: "GET",
            url: "https://blockscout.com/etc/mainnet/api?module=transaction&action=gettxinfo&txhash="+apidata.txHash
        })
        .then(function (err,responses) {
            // console.log("XRP",err);
            console.log("XRP",responses.result);

                amountget = Number(responses.result.value/(10**18)); 

                // console.log(req.body)
                var date = moment();
                date = date.tz("Asia/Calcutta").format("YYYY-MM-DD HH:mm:ss A")
                MongoClient.connect(url, async function (err, db) { 
                    // if (err) throw err;
                    var dbo = db.db("coindekhodevd_Server");
                    dbo.collection("coindekhodevdETC").findOne({walletAddress:(apidata.address).toLowerCase()}, async function (err, result) {
                        
                        if(result) {
                            console.log("result",result.userId)
                            var myqueryUser = { userId: new mongo.ObjectID(result.userId) }

                            await dbo.collection("coindekhodevdDeposite").findOne({txid:apidata.txHash}, async function (err4, res4) {
                                // console.log("found",res4)
                                if(res4 == null) {
                                    await dbo.collection("coindekhodevdUserBalance").findOne(myqueryUser, async function (err2, res2) {
                                        var currentBalance = Number(res2["ETC"])
                                        var tobeAddedBalance = Number(amountget)
                                        var finalBalance = Number(currentBalance + tobeAddedBalance).toFixed(8)
                                        // console.log(finalBalance)
                    
                                        await dbo.collection("coindekhodevdUserBalance").findOneAndUpdate(myqueryUser, { $set: {ETC : finalBalance} }, function (err3, res3) {
                    
                                        })
                                        let insertData = {
                                            "userId" : result.userId, 
                                            "coinName" : "ETC", 
                                            "amount" : tobeAddedBalance, 
                                            "walletAddress" : (apidata.address).toLowerCase(), 
                                            "txid": apidata.txHash,
                                            "fees" : 0, 
                                            "date" : date, 
                                            "status" : "Completed", 
                                            "isDeleted" : false, 
                                        }
                                        await dbo.collection("coindekhodevdDeposite").insertOne(insertData, function (err4, res4) {
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

        })


    



    }else {
        resMain.send({
            "statusCode": 200,
            "message": "success"
        })
    }
	
    
})



app.listen(3004, function() {
    console.log('app running on port : 3004');
});
