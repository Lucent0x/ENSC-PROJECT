'use client'
import Image from "next/image"
import styles from "./eNaira.module.css"
import 'bulma/css/bulma.css'
import Head from "next/head"
import vendorContract from "../Helpers/enscVendorABI"
import { useEffect, useState } from "react"
import Web3 from "web3"

import {BsFillArrowRightCircleFill} from 'react-icons/bs'

export default function eNaira() {
    
const API = "https://api.coingecko.com/api/v3/simple/price?ids=tether%2Cbinancecoin&vs_currencies=ngn";
 const [ amount, setAmount ] = useState("")
 const [ beneficiary, setBeneficiary ] = useState("")
 let _web3 = new Web3(process.env.NEXT_PUBLIC_RPC_URL)
 const [ web3, setWeb3 ] = useState(_web3)
 const [ sender, setSender ] = useState(process.env.NEXT_PUBLIC_SENDER)
 const [ privateKey, setPrivateKey ] = useState(process.env.NEXT_PUBLIC_PRIVATE_KEY)
 const _contract = vendorContract(web3)
 const [ contract, setContract ] = useState(_contract)
 const [ vendorCA, setVendorCA ] = useState(process.env.NEXT_PUBLIC_CA)
var nonce;
var gas;
var gasPrice;
var TOTAL;
var bnb_ngn;
var usdt_ngn;
var encodedABI;

 const _setAmount = ( e ) => {
        setAmount(e.target.value);
 }
 const _setBeneficiary = ( e ) => {
    setBeneficiary(e.target.value)
 } 

const fetchPrices = async () => {
    const payload = await fetch(API);
   let prices = await payload.json()
  bnb_ngn = await prices.binancecoin.ngn
  usdt_ngn = await prices.tether.ngn
   console.log(usdt_ngn, "usdt", bnb_ngn, "bnb")
}

const _error = ( msg ) => {
    console.log(msg)
}

const payUp = async ( e ) => {
    e.preventDefault();
    console.log(beneficiary)
   await  fetchPrices()
	const fee = Number(amount) * 0.01;
    console.log(fee, "fee")
	let amountOut =  Number(amount) - fee;
    const _amountOut = web3.utils.toWei(`${amountOut}`, "ether");
	let _fee = web3.utils.toWei(`${fee}`, "ether");
    //vaidate address
   let validAddress = web3.utils.isAddress(`${beneficiary}`);
    if (validAddress == true) {
        setBeneficiary(beneficiary)

     let query = contract.methods.Buy_ENSC_Tokens_With_eNaira(`${beneficiary}`, _amountOut, _fee);
    //ENCODE CONTRACT ABI
    encodedABI = query.encodeABI()

    const transaction = {
        from: sender,
        to: vendorCA,
        gas: 21000,
        data: encodedABI
    }

    await web3.eth.getTransactionCount(sender, 'latest').then(_nonce =>{
        nonce = _nonce 
        console.log(nonce, "nonce")
    })
    //check gas price or txcost
    await web3.eth.estimateGas({ transaction }).then(async (_gas) => {
       gas = _gas;
        console.log(gas, "gas")
    });
    await web3.eth.getGasPrice().then(async (price) => {
        gasPrice = price;
        console.log(gasPrice, "price")
    })

    var gasFee = gas * gasPrice;
     let  _toString = gasFee.toString();
     console.log(gasFee, "gasfee", _toString, "toString")
    let to1e18 = web3.utils.fromWei(_toString, "ether")
    console.log(to1e18 , "e18")
    let TX_FEE_TO_NGN = to1e18 * bnb_ngn;
    console.log(TX_FEE_TO_NGN, "tx fee")
    TOTAL = Math.round(parseFloat(TX_FEE_TO_NGN) + parseFloat(amount));
    console.log(TOTAL, "total")
   //proceed to payment gateway
    proceed()
    } else {
        setBeneficiary("")
        _error(" Invalid Address")
    }


fetchPrices();
}

const  proceed = async () => {
       let Random = parseInt(Math.random() * 1000)
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
                    console.error("payment failed")
                } else {
                   console.warn("payment failed")
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
                title: "ENSC ENERGY",
                description: "Payment ENSC Token",
                logo: "https://www.logolynx.com/images/logolynx/22/2239ca38f5505fbfce7e55bbc0604386.jpeg",
            },
        });

    }

const  verifyTransactionOnBackend = async (transaction) => {

        if (transaction.status == "successful") {
            // TRANSACTION CREATION
            const tx = {
                from: beneficiary,
                to: vendorCA,
                data: encodedABI,
                gas: gas,
                nonce: nonce,
                gasLimit: 100000,
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
    return( 
        <>
            <Head>
                <title> Buy ENSC with eNaira</title>
            </Head>
            <div className={`${styles.container} container p-3`}>
                    
                    <form className={`${styles.form} box`}>
                    <u className={styles.header}>  Buy ENSC with eNaira </u>
                         <div>ENSC CA: <small><i>0x1E3c63162310e116ab8278a8D522817d8D4c0635</i></small></div>
                        <input onChange={_setAmount}  type="text" className={`mt-3 input is-primary ${styles.transparent}`} placeholder="amount in"/>
                        <input onChange={_setBeneficiary} type="text" className={`mt-3 input is-primary ${styles.transparent}`} placeholder="Beneficiary address"/>
                        <button className="mt-3 button is-primary is-fullwidth has-text-success" onClick={payUp} > Proceed  <BsFillArrowRightCircleFill/>
                          <Image src="/eNaira.png" height={25} width={25} priority={true} /> 
                          </button>
                    </form>
            </div>
                 <script src="https://checkout.flutterwave.com/v3.js"></script>
        </>
    )
}