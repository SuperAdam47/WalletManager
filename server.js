var express =require('express');
var BnbManager =require("./src/centerpirme.js").BnbManager;
var cors =require('cors');
// var mysql =require('mysql');
var dotenv =require('dotenv');
dotenv.config()



const app = express(),
      port = 3080;

// place holder for the data
const users = [];
app.use(cors())
app.use(express.json());
var bnbManager = new BnbManager(process.env.infraUrl);

app.post('/api/createWallet', (req, res) => {
  console.log("post /api/createWallet");
  let response = bnbManager.createAccount();
  res.json(response);
});

app.post('/api/hello', (req, res) => {
  console.log("post /api/hello");
  res.json("hello");
});

app.post('/api/tokenBalance', async function(req,res) {
  try {
    const address = req.body.address;
    const tokenContractAddress = req.body.tokenAddress;
    let balance = await bnbManager.getBEPTokenBalance(tokenContractAddress,address)
    // console.log(balance);
    console.log("post /api/tokenBalance");
    res.json({balance : balance});
  } catch(e) {
     return res.status(401).send({
      message : e.message
   });
  }
});

app.post('/api/sendBnb', async function(req,res) {
  try {
  //   const keystore = req.body.keystore;
  //   const password = req.body.password;
    const privateKey = req.body.privateKey;
    const toAddress = req.body.toAddress;
    const amount = req.body.amount;
    // console.log("privateKey:", privateKey, "toAddress:", toAddress, "amount:", amount)
    let result = await bnbManager.sendBNB(privateKey,toAddress,amount,3)
    console.log(result);
    res.json({hash:result});
  } catch(e) {
     return res.status(401).send({
      message : e.message
   });
  }
});
app.post('/api/sendToken', async function(req,res) {
  try {
    console.log("post /api/sendToken");
    const privateKey = req.body.privateKey;
    const tokenContractAddress = req.body.tokenContractAddress;
    const toAddress = req.body.toAddress;
    const amount = req.body.amount;
    let result = await bnbManager.sendToken(privateKey,tokenContractAddress,toAddress,parseFloat(amount),3)
    
    res.json({hash : result.transactionHash});
  } catch(e) {
    console.log(e)
     return res.status(401).send({
      message : e.message
   });
  }
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});