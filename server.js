var express =require('express');
var BnbManager =require("./src/centerpirme.js").BnbManager;
var cors =require('cors');
var mysql =require('mysql');
var dotenv =require('dotenv');
dotenv.config()
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

var bnbManager = new BnbManager(process.env.infraUrl);

const app = express(),
      port = 3080;

// place holder for the data
const users = [];
app.use(cors())
app.use(express.json());

app.post('/api/createWallet', (req, res) => {
  // const password = req.body.password;
  // let wallet = bnbManager.createAccount(password)
  let response = bnbManager.createAccount();
  // console.log(response.wallet.address);
  var sql = `INSERT INTO wallet (address, private_key) VALUES ('${response.wallet.address}', '${response.wallet.privateKey}')`;
  // console.log(sql);
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
  // console.log(wallet);
  res.json(response);
});


// app.post('/api/importWallet', (req, res) => {
//   try {
//     const password = req.body.password;
//     const keystore = req.body.keystore;
//     let wallet = bnbManager.importWalletByKeystore(keystore,password)
//     console.log(wallet);
//     res.json(wallet);
//   } catch(e) {
//      return res.status(401).send({
//       message : e.message
//    });
//   }
// });

app.post('/api/bnbBalance', async function(req,res) {
  try {
    const addresses = req.body.address;
    // console.log(addresses);

    const promiseBalances = (address) => {
      return new Promise((resolve) => {
        bnbManager.getBnbBalance(address)
        .then(balance => resolve({address, balance}))
        .catch((err) => {
          resolve({address,error:err.message})
          console.error("Error:", err.message)
          
        })
      }) 
    }

    Promise.all(addresses.map(address => promiseBalances(address)))
      .then((balances) => {
        // console.log(balances);
        res.json(balances);  
      })

  } catch(e) {
     return res.status(401).send({
      message : e.message
   });
  }
});

// app.post('/api/tokenBalance', async function(req,res) {
//   try {
//     const address = req.body.address;
//     const tokenContractAddress = req.body.tokenAddress;
//     let balance = await bnbManager.getBEPTokenBalance(tokenContractAddress,address)
//     console.log(balance);
//     res.json(balance);
//   } catch(e) {
//      return res.status(401).send({
//       message : e.message
//    });
//   }
// });


app.post('/api/sendBnb', async function(req,res) {
  try {
  //   const keystore = req.body.keystore;
  //   const password = req.body.password;
    const privateKey = req.body.privateKey;
    const toAddress = req.body.toAddress;
    const amount = req.body.amount;
    console.log("privateKey:", privateKey, "toAddress:", toAddress, "amount:", amount)
    let balance = await bnbManager.sendBNB(privateKey,toAddress,amount,3)
    console.log(balance);
    res.json(balance);
  } catch(e) {
     return res.status(401).send({
      message : e.message
   });
  }
});
app.post('/api/depositeBNB', async function(req,res) {
  try {
  
    // const fromAddress = req.body.fromAddress;
    // const amount = req.body.amount;
    const deposites = req.body.deposites;

    
    // console.log(sql);
    const promiseDeposites = (deposite,index) => {
      // console.log(withdrawal,index)
      return new Promise((resolve) => {
        var fromAddress = deposite.fromAddress;
      
        var sql = `SELECT private_key from wallet WHERE address = '${fromAddress}'`;
        con.query(sql, async function (err, result) {
          if (err) throw err;
          const privateKey = result[0].private_key;  
          bnbManager.depositeBNB(privateKey, deposite.amount, index, 3)
          .then(hash => resolve({
            fromAddress:deposite.fromAddress, 
            amount:deposite.amount, 
            hash
          }))
          .catch((err) => {
            resolve({
              fromAddress:deposite.fromAddress, 
              amount:deposite.amount, 
              error:err.message
            })
            console.error("Error:", err.message)
            
          })
        })
    }) 
    }

    Promise.all(deposites.map((deposite,index) => promiseDeposites(deposite,index)))
      .then((transactionHashs) => {
        console.log(transactionHashs);
        res.json(transactionHashs);  
      })
    
  } catch(e) {
     return res.status(401).send({
      message : e.message
   });
  }
});

app.post('/api/withdrawalBNB', async function(req,res) {
  try {
  
      
    const withdrawals = req.body.withdrawals;
    const promiseWithdrawals = (withdrawal,index) => {
      // console.log(withdrawal,index)
      return new Promise((resolve) => {
        bnbManager.withdrawalBNB(withdrawal.toAddress, withdrawal.amount, index, 3)
        .then(hash => resolve({toAddress:withdrawal.toAddress, amount:withdrawal.amount, hash}))
        .catch((err) => {
          resolve({toAddress:withdrawal.toAddress,amount:withdrawal.amount,error:err.message})
          console.error("Error:", err.message)
          
        })
    }) 
    }

    Promise.all(withdrawals.map((withdrawal,index) => promiseWithdrawals(withdrawal,index)))
      .then((transResults) => {
        // console.log(balances);
        res.json(transResults);  
      })

  } catch(e) {
     return res.status(401).send({
      message : e.message
   });
  }
});

// app.post('/api/sendToken', async function(req,res) {
//   try {
//     const keystore = req.body.keystore;
//     const password = req.body.password;
//     const tokenContractAddress = req.body.tokenContractAddress;
//     const toAddress = req.body.toAddress;
//     const amount = req.body.amount;
//     let balance = await bnbManager.sendToken(keystore,password,tokenContractAddress,toAddress,parseFloat(amount),3)
//     console.log(balance);
//     res.json(balance);
//   } catch(e) {
//      return res.status(401).send({
//       message : e.message
//    });
//   }
// });

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});