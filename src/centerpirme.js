var Web3 = require('web3');



let bep20ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    }
]

class BnbManager {
    constructor(infuraUrl) {
        this.web3 = new Web3(new Web3.providers.HttpProvider(infuraUrl));
    }

    //  createAccount(password) {
    createAccount() {
        // let account = this.web3.eth.accounts.create(password);
        let account = this.web3.eth.accounts.create();
        let wallet = this.web3.eth.accounts.wallet.add(account);
        // let keystore = wallet.encrypt(password);

        const response = {
            // account: account,
            wallet: wallet,
            // keystore: keystore,
        }

        return response;

    }
    
    importWalletByKeystore(keystore, password) {
        let account = this.web3.eth.accounts.decrypt(keystore, password,false);
        let wallet = this.web3.eth.accounts.wallet.add(account);
        const response = {
            account: account,
            wallet: wallet,
            keystore: keystore,
        };
        

        return response;
    }
    
    
    importWalletByPrivateKey(privateKey) {
        const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        let wallet = this.web3.eth.accounts.wallet.add(account);
        let keystore = wallet.encrypt(this.web3.utils.randomHex(32));
        const responsse = {
            account: account,
            wallet: wallet,
            keystore: keystore,
        };

        return responsse;
    }
    
    async getBEPTokenBalance(tokenAddress , address) {
        // ABI to transfer ERC20 Token
        let abi = bep20ABI;
        // Get ERC20 Token contract instance
        let contract = new this.web3.eth.Contract(abi, tokenAddress);
        // console.log(contract);
        // Get decimal
        let decimal = await contract.methods.decimals().call();
        // console.log(decimal);
        // Get Balance
        let balance = await contract.methods.balanceOf(address).call();
       
       
        return balance / Math.pow(10,decimal);
    }

    async sendToken(privateKey, tokenContractAddress , toAddress , amount , chainId) {
    
        let wallet = this.importWalletByPrivateKey(privateKey).wallet;
        // ABI to transfer ERC20 Token
        let abi = bep20ABI;
        // calculate ERC20 token amount
        
        // Get ERC20 Token contract instance
        let contract = new this.web3.eth.Contract(abi, tokenContractAddress, {from: wallet.address});

        let decimal = await contract.methods.decimals().call();
        let tokenAmount = parseInt(amount * Math.pow(10,decimal));

        let currNonce =await this.web3.eth.getTransactionCount(wallet.address)
        // Build a new transaction object.
        const gasLimit = await contract.methods.transfer(toAddress, tokenAmount.toString()).estimateGas({
            from: wallet.address,
            gas: 150000,
            nonce:currNonce
        });
        // console.log(tokenAmount)
        const res = await contract.methods.transfer(toAddress, tokenAmount.toString()).send({
            from: wallet.address,
            gas: gasLimit,
            nonce:currNonce

        });

        // console.log(res);
       
        return res;
    }
    async sendBNB(privateKey, toAddress, amount, chainId) {
        let account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        let wallet = this.web3.eth.accounts.wallet.add(account);

        // The gas price is determined by the last few blocks median gas price.
        const avgGasPrice = await this.web3.eth.getGasPrice();
        console.log(avgGasPrice);
        
        const createTransaction = await this.web3.eth.accounts.signTransaction(
            {
            //    from: wallet.address,
               to: toAddress,
               value: this.web3.utils.toWei(amount.toString(), 'ether'),
               gas: 21000,
               gasPrice : avgGasPrice
            },
            wallet.privateKey
         );

         console.log(createTransaction);
      
         // Deploy transaction
        const createReceipt = await this.web3.eth.sendSignedTransaction(
            createTransaction.rawTransaction
        );

        console.log(
            `Transaction successful with hash: ${createReceipt.transactionHash}`
        );

       
        return createReceipt.transactionHash;
    }

}


module.exports.BnbManager = BnbManager;