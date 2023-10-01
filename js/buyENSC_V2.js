
const API = "https://api.coingecko.com/api/v3/simple/price?ids=tether%2Cbinancecoin&vs_currencies=ngn";
let NGN_PAID;
let BENEFICIARY;
let TOKENS;
let ONE_USDT;
let GAS;
let GAS_PRICE;
var NONCE;
let TX_FEE;
let USDT_NGN;
let BNB_NGN;
var TOTAL;
let getBNB = document.querySelector(".bnb");
let getTether = document.querySelector(".tether");
var proceedMsg = document.querySelector(".proceed-msg")
var proceed = document.querySelector("button#proceed")
var cancel = document.querySelector("button#cancel")
var connectButton = document.querySelector(".connecWallet")
const buyBotton = document.querySelector("button#buy");
var walletContract;
var webIII;
var Address;
var prices;
var receipts = document.querySelector(".receipts");
const polygonProvider = 'https://polygon-mumbai.g.alchemy.com/v2/6NXFPx0MMHkVDsCBGBH0TCB9YZp7L8Jr'
const polyonCA = '0xBD03e51De6F8B8966Be12f7bAebF6F2059dF949F'
const sepoliaProvider = 'https://eth-sepolia.g.alchemy.com/v2/ePJuuYH6yWSCRAbCjV3gLy_znj03wCt9'
const RPC_URL ="https://rpc.ankr.com/bsc_testnet_chapel";
const sepoliaCA = '0xB94D8a0009D5B7362390BC8f146762dC561F3c74'
const ABI = [
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
];


const amount = document.querySelector("input.NGN");
amount.onchange = ( ) =>{
    buyBotton.innerHTML = ` BUY ${amount.value} $ENSC`;
}

const fetchPrices = async () => {
    const payload = await fetch(API);
    prices = await payload.json()
    BNB_NGN = prices.binancecoin.ngn;
    USDT_NGN = prices.tether.ngn;
    getBNB.innerHTML = `BNB/NGN : ${BNB_NGN}`;
    getTether.innerHTML = `USDT/NGN: ${USDT_NGN}`;
}
fetchPrices();
const _error = (msg) => {
    alert(msg)
}

FORM = document.querySelector(".form");
FORM.onsubmit = async (e) => {
    e.preventDefault();

    const NGN = document.querySelector("input.NGN").value;
    var beneficiary = document.querySelector("input.beneficiary").value;

    var web3 = new Web3(RPC_URL);
    const _amount = web3.utils.toWei(`${Number(NGN)}`, "ether");
    //check if address is valid
    validAddress = web3.utils.isAddress(`${beneficiary}`);
    if (validAddress == true) {
        beneficiary = beneficiary
    } else {
        _error(" Invalid Address")
    }
    const sender = '0x78EeF3BA63473733D236C6a9F6f602a8881129c8';
    // static beneficiary : 0x507AC153C2dd7c7ABCae96d0F385485B81ebA8BF
    const contractAddress = '0xc5E3E5cEba45433eaeD6957c5e70E2F1C66d5c72';
    const privateKey = 'a03ccc4fd6704ff2ca56cc6b36db9cac788c1cd02a5a592286c066732ea5fcb3';

    const contract = new web3.eth.Contract(ABI, sepoliaCA);

    // CONTRACT INTERACTION BEGINS HERE
    query = contract.methods.Buy_ENSC_Tokens_With_eNaira(beneficiary, _amount)
    //ENCODE CONTRACT ABI
    const encodedABI = query.encodeABI()

    const transaction = {
        from: sender,
        to: contractAddress,
        gas: 21000,
        data: encodedABI
    }
    await web3.eth.getTransactionCount(sender, 'latest').then(nonce =>{
        NONCE = nonce 
    })
    //check gas price or txcost
    await web3.eth.estimateGas({ transaction }).then(async (gas) => {
        GAS = gas;
    });
    await web3.eth.getGasPrice().then(async (price) => {
        GAS_PRICE = price;
        //  console.log(Number(GAS_PRICE).toString() * Number(GAS).toString() )
    })

    var gasFee = GAS * GAS_PRICE;
    _toString = gasFee.toString();
    let to1e18 = web3.utils.fromWei(_toString, "ether")
    let TX_FEE_TO_NGN = to1e18 * BNB_NGN;
    TOTAL = Math.round(parseFloat(TX_FEE_TO_NGN) + parseFloat(NGN));
    proceedMsg.innerHTML = ` 
                    Your transaction cost includes <b>NGN ${NGN} </b>  for  <b>${NGN} ENSC </b>& <b>${to1e18} </b>as Gas Fee.
                    if 1 BNB cost <b> ${BNB_NGN} NGN</b> so <b>${to1e18} BNB</b> = <b>NGN ${TX_FEE_TO_NGN} </b> , <b> Total cost = NGN ${TOTAL} </b>
                   <div class="btns mt-2">
                       <button id="proceed" onclick="proceed()"class="button is-success is-light mr-2"> proceed </button>
                      <button id="cancel" onclick="cancel()"  class="button is-danger is-light ml-2"> cancel </button>
                   </div> `;
    proceedMsg.style.display = "block";

    proceed = async () => {
        Random = parseInt(Math.random() * 1000)
        FlutterwaveCheckout({
            public_key: "FLWPUBK_TEST-cd94ba5d8645e63dfcfa7ddc95de6f19-X",
            tx_ref: `ENSC-${Random}Token`,
            amount: TOTAL,
            currency: "NGN",
            payment_options: "card, mobilemoneyghana, ussd,enaira",
            callback: function (payment) {
                // Send AJAX verification request to backend
                verifyTransactionOnBackend(payment);
            },
            onclose: function (incomplete) {
                if (incomplete || window.verified === false) {
                    document.querySelector("#payment-failed").style.display = 'block';
                } else {
                    // document.querySelector("form").style.display = 'none';
                    // if (window.verified == true) {
                    //     document.querySelector("#payment-success").style.display = 'block';
                    // } else {
                    //     // document.querySelector("#payment-pending").style.display = 'block';
                    // }
                }
            },
            meta: {
                consumer_id: beneficiary,
                consumer_mac: "92a3-912ba-1192a",
            },
            customer: {
                email: "rose@unsinkableship.com",
                phone_number: "08102909304",
                name: "Rose DeWitt Bukater",
            },
            customizations: {
                title: "ENSC ENERY",
                description: "Payment ENSC Token",
                logo: "https://www.logolynx.com/images/logolynx/22/2239ca38f5505fbfce7e55bbc0604386.jpeg",
            },
        });

    }

    cancel  = () => {
        _error("Transaction Canceled")
          proceedMsg.style.display = "none";
          amount.value = "";
    }


    async function verifyTransactionOnBackend(transaction) {

        if (transaction.status == "successful") {
            console.log(transaction);
            // TRANSACTION CREATION
            const tx = {
                from: beneficiary,
                to: contractAddress,
                data: encodedABI,
                gas: GAS,
                nonce: NONCE,
                gasLimit: '100000',
                maxPriorityFeePerGas: '0x3b9aca00',
                maxFeePerGas: '0x2540be400'
            };

            // Sign and send the transaction
            web3.eth.accounts.signTransaction(tx, privateKey)
                .then((signedTx) => {
                    console.log( "Transaction Hash", signedTx.rawTransaction)
                    
                    web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                        .on('receipt', (receipt) => {
                            console.log('Transaction receipt:', receipt);
                            receipts.innerHTML = `<p has-text-success>Transction completed  🎉<br/> 
                            <b><u> ENSC Transcation Receipt. </u> Txhash :  <i> ${receipt.transactionHash} </i>  Utilize Tx hash on Sepolia block explorer. 😎</p>`;
                            proceedMsg.style.display = "none";
                            amount.value = "";
                        })
                        .on('error', (error) => {
                            console.error('Transaction error:', error);
                        });
                })
                .catch((error) => {
                    console.error('Transaction signing error:', error);
                });
        }
    }
}

