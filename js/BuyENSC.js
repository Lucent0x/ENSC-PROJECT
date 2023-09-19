const  API ="https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=ngn";
let NGN_PAID;
let BENEFICIARY;
let TOKENS;
let ONE_USDT;
const ABI = ` [
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "_wallet",
				"type": "address"
			},
			{
				"internalType": "contract ERC20",
				"name": "_token",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "purchaser",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "beneficiary",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokens",
				"type": "uint256"
			}
		],
		"name": "TokenPurchase",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_beneficiary",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_tokens",
				"type": "uint256"
			}
		],
		"name": "Buy_ENSC_Tokens_With_eNaira",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ENSC_Token",
		"outputs": [
			{
				"internalType": "contract ERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ENSC_Wallet",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "weiSold",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
]`;


window.onload = async ( ) => {
    const fetchPrice = ( )=>{
    const XHR = new XMLHttpRequest();
    XHR.open( "GET", API, true );
    XHR.onload = ( ) => {
        
    let usdPrice = document.querySelector(".usd");
        if ( XHR.readyState = XMLHttpRequest.DONE ){
            if ( XHR.status == 200 ){
               let response = JSON.parse(XHR.response) ;
                let tether = response.tether;
                ONE_USDT = tether.ngn;
                //display price
                usdPrice.innerText= ` USD/NGN : ${ONE_USDT}`;
                // convert to number and approximate.
                USDT_NGN = Number(ONE_USDT).toFixed(0);
            }
        }
    }
    XHR.send();
}
fetchPrice();

//setInterval(fetchPrice, 2000);

const Form = document.querySelector(".form");
Form.onsubmit = async ( e ) => {
    e.preventDefault();
    BENEFICIARY = document.querySelector("input.beneficiary").value; 
    NGN_PAID = document.querySelector("input.NGN").value; 

                // static beneficiary : 0x507AC153C2dd7c7ABCae96d0F385485B81ebA8BF
                var web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-mumbai.g.alchemy.com/v2/6NXFPx0MMHkVDsCBGBH0TCB9YZp7L8Jr'));
                ///ENSC SALE CA
                const contractAddress = '0xBD03e51De6F8B8966Be12f7bAebF6F2059dF949F';
                  // Contract Instance
                const contract = new web3.eth.Contract(JSON.parse(ABI), contractAddress);
                const privateKey = 'a03ccc4fd6704ff2ca56cc6b36db9cac788c1cd02a5a592286c066732ea5fcb3';
                 //CONVERT NGN to ENSC Token bits
                let wei =  web3.utils.toWei(`${Number(NGN_PAID)}`, "ether");
                //STATIC SENDER //can be customised
                 let _sender = '0x78EeF3BA63473733D236C6a9F6f602a8881129c8';
                 //NONCE IS OPTIONAL THOUGH
                 const nonce = await web3.eth.getTransactionCount(_sender, 'latest'); 
                 // CONTRACT INTERACTION BEGINS HERE
                 query =  contract.methods.Buy_ENSC_Tokens_With_eNaira( `${BENEFICIARY}`, `${wei}` )
                 //ENCODE CONTRACT ABI
                  const encodedABI = query.encodeABI()
                  // TRANSACTION CREATION
                const tx = {
                     from: _sender,
                     to: contractAddress,
                     data: encodedABI,
                     gas: '99000',
                     gasLimit: '100000', 
                     maxPriorityFeePerGas: '0x3b9aca00', 
                     maxFeePerGas: '0x2540be400'
                    };
            // SIGN TRANSACTION
                  web3.eth.accounts.signTransaction(tx, privateKey).then(  async ( signed ) => {
                    // EXTRACT  THE RAW TxHash
                        hashed = signed.rawTransaction

                            console.log("Txhash : ", signed)
                     // THIS SECTION KEEPS ACTING UP, I WONDER WHY? 🥺😢       
                        await web3.eth.sendSignedTransaction(hashed, (error, hash) => {
                           // CHECK TRANSACTION STATE
                                  if(!error){
                           console.log("🎉 The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");
                                  }else{
                                    // TRANSACTION ENDS HERE.
                                    console.error("failed : ",error)
                                  }
                        
                 
                                })
              
                })
            }}
