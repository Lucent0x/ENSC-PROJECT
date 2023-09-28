const API = "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=ngn";
const privateKey = "";
const RPC_URL ="";
const web3 = new Web3(RPC_URL);
const contract = web3.eth.Contract(ABI, CA);
var update;
var NONCE;
var GAS;
var GAS_PRICE;

    const fetchPrice = async ( ) => {
        let request = await fetch(API)
        response = request.json()
        tether = response.tether;
        _usd = Number(_usd);

        // call the contract
        oracle( price )
    }

fetchPrice();

const oracle = async ( _currentRate ) => {
    //onchain price of usd
   let  contract_rate = await contract.methods.USD_RATE.call();
   if ( _currentRate > contract_rate ){
     update  =  await contract.methods.updateRate(_currentRate);
     //create an instance of the  tx
     transaction = {
        from: sender,
        to: CA,
        data: update.ABIencoded()
     }

    await web3.eth.getTransactionCount(sender, 'latest').then(nonce =>{
        NONCE = nonce 
    })
    //check gas price or txcost
    await web3.eth.estimateGas({ transaction }).then(async (gas) => {
        GAS = gas;
    });

      let tx = {
                from: beneficiary,
                to: contractAddress,
                data: encodedABI,
                gas: GAS,
                nonce: NONCE,
                gasLimit: '100000',
                maxPriorityFeePerGas: '0x3b9aca00',
                maxFeePerGas: '0x2540be400'
      }
        
      sendTransaction ( tx )

   }else if ( _currentRate < contract_rate ){
     update = contract.methods.updateRate(_currentRate);     
            transaction = {
                from: sender,
                to: CA,
                data: update.ABIencoded()
            }

        
     update  =  await contract.methods.updateRate(_currentRate);
     //create an instance of the  tx
     transaction = {
        from: sender,
        to: CA,
        data: update.ABIencoded()
     }

    await web3.eth.getTransactionCount(sender, 'latest').then(nonce =>{
        NONCE = nonce 
    })
    //check gas price or txcost
    await web3.eth.estimateGas({ transaction }).then(async (gas) => {
        GAS = gas;
    });

      let tx = {
                from: beneficiary,
                to: contractAddress,
                data: encodedABI,
                gas: GAS,
                nonce: NONCE,
                gasLimit: '100000',
                maxPriorityFeePerGas: '0x3b9aca00',
                maxFeePerGas: '0x2540be400'
      }
        
      sendTransaction ( tx )

   }else{
    console.log("Equal rates")
   }
}

const sendTransaction = async ( _tx ) => {
    
            // Sign and send the transaction
            web3.eth.accounts.signTransaction(_tx, privateKey)
                .then((signedTx) => {
                    console.log( "Transaction Hash", signedTx.rawTransaction)
                    
                    web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                        .on('receipt', (receipt) => {
                            console.log('Transaction receipt:', receipt);
                        })
                        .on('error', (error) => {
                            console.error('Transaction error:', error);
                        });
                })
                .catch((error) => {
                    console.error('Transaction signing error:', error);
                });
    
}

setInterval(fetchPrice(), 5000)