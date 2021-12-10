var express = require('express'),
    cors = require('cors'),
    app = express();
var bodyParser = require('body-parser');
const moment = require('moment-timezone');
var Wallet = require('ethereumjs-wallet');


const TronWeb = require('tronweb')
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.trongrid.io");
const solidityNode = new HttpProvider("https://api.trongrid.io");
const eventServer = new HttpProvider("https://api.trongrid.io");
const privateKey = "436f57408249332b76c41216134745efb1078e917e3b41320cef0fba759476e4";
const tronWeb = new TronWeb(fullNode,solidityNode,eventServer,privateKey);

  
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


app.use(cors());




app.get('/', function(req, res) {

    res.send("This API server is developed for BITCOIN");
})

app.post('/newwallet', function(req, resMain) {

    const EthWallet = Wallet.generate();
console.log("address: " + EthWallet.getAddressString());
console.log("privateKey: " + EthWallet.getPrivateKeyString());
resMain.send({
    "walletAddress": EthWallet.getAddressString(),
    "privateKey": EthWallet.getPrivateKeyString()
})
    
})

app.post('/newwalletxrp', function(req, resMain) {

resMain.send({
    "address": "rhSP122GF6g3LDPD1fJwxb1TLFqGcaHKoe",
    "privateKey":""
})
    
})

app.post('/newwallettrx', async function(req, resMain) {

     var data = tronWeb.createAccount().then((res)=> {
        // console.log(res)

        resMain.send({
            "address": res.address.base58,
            "privateKey":res.privateKey
        })

     });
    
        
})


app.listen(3003, function() {
    console.log('app running on port : 3003');
});
