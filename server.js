var express =require('express');
var BnbManager =require("./src/centerpirme.js").BnbManager;
var cors =require('cors');
var mysql =require('mysql');
var dotenv =require('dotenv');
dotenv.config()

var bnbManager = new BnbManager(process.env.infraUrl);
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bnb_manager"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

const app = express(),
      port = 80;

// place holder for the data
const users = [];
app.use(cors())
app.use(express.json());

app.post('/api/createWallet', (req, res) => {

  let response = bnbManager.createAccount();

  var sql = `INSERT INTO wallet (address, private_key) VALUES ('${response.wallet.address}', '${response.wallet.privateKey}')`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    // console.log("1 record inserted");
  });

  res.json(response);
});


app.post('/api/tokenBalance', async function(req,res) {
  try {
    const address = req.body.address;
    const tokenContractAddress = req.body.tokenAddress;
    let balance = await bnbManager.getBEPTokenBalance(tokenContractAddress,address)
    // console.log(balance);
    res.json({balance : balance});
  } catch(e) {
     return res.status(401).send({
      message : e.message
   });
  }
});


app.post('/api/sendToken', async function(req,res) {
  try {
    const privateKey = req.body.privateKey;
    const tokenContractAddress = req.body.tokenContractAddress;
    const toAddress = req.body.toAddress;
    const amount = req.body.amount;
    let result = await bnbManager.sendToken(privateKey,tokenContractAddress,toAddress,parseFloat(amount),3)
    
    res.json({hash : result.transactionHash});
  } catch(e) {
     return res.status(401).send({
      message : e.message
   });
  }
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});