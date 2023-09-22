  const connectWalletHandler = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        //requesting for wallet connection
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        webIII = new Web3(window.ethereum)

        // choosing an account
        const accounts = await web3.eth.getAccounts()
        Address = accounts[0];
        connectButton.innerHTML = Address;
        // bringing in the wallet 
         walletContract =new webIII.eth.Contract(ABI, contractAddress)

        // event 
        window.ethereum.on('accountsChanged', async () => {
          // Time to reload your interface with accounts[0]!
          let accounts = await webIII.eth.getAccounts()
          Address = accounts[0];
          connectButton.innerHTML = Address;

        });

      } catch (error) {
        _error(error.message)
      }
    } else {
      _error('pls install metamask');
    }
  }
    