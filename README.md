# ENSC ENERGY

**ENSC TOKEN CONTRACT**

```solidity
    constructor()
        ERC20("ENSC ENERGY", "ENSC")
        ERC20Capped(20000000000 * (10 ** decimals()))
    {
    }
```

- ENSC_ToKEN.sol already has it's constructors arguments provided.
  Using Remix IDE all you have to do is compile and deeploy the contract.
- **ENSC VENDOR CONTRACT**

```solidity

   constructor(
       address payable _wallet,
       ERC20 _token,
       address _usdc,
       address _usdt,
       uint256 _usdRate
   ) {
   }

```

- ENSC_VENDOR.sol smart contract accepts four arguments

* The ENSC TOKEN Contract Address.
* Bep20 USDC Contract Address.
* Bep20 USDT Contract Address.
* The Latest Price of USD As An Unsigned Integer.

_Using the Remix IDE once you've provided those agument, compile and deploy the ENSC_Vendor contract._

### ENSC VENDOR CONTRACT EXTERNAL & PUBLIC FUNCTIONS

1.  _check and whitelist tokens_

```solidity
 function addTokenToWhitelist(address tokenAddress) external onlyOwner{}
```

2. _Remove a token from the whitelist_

```solidity
function removeTokenFromWhitelist(address tokenAddress) external onlyOwner{}
```

3. _Update USD price_

```
function updateRate(uint256 _newRate) public onlyOwner {}
```

4. _update the USDT contract address_

```solidity
function setUSDT(address _usdt) public onlyOwner{}
```

5.  _update the USDC contract address_

```solidity
function setUSDC(address _usdt) public onlyOwner{}
```

6.  _Handle Purchase of ENSC Token with eNaira_

```solidity
function Buy_ENSC_Tokens_With_eNaira(address _beneficiary, uint256 _tokens){}
        public
        payable
        onlyOwner
```

7. _Handle Purchase of ENSC Token with USDT_

```solidity
function Buy_ENSC_Tokens_With_USDT(uint256 _amount) public payable {}
        public
        payable
        onlyOwner
```

8. _Handle Purchase of ENSC Token with USDC_

```solidity
function Buy_ENSC_Tokens_With_USDC(uint256 _amount) public payable {}
        public
        payable
        onlyOwner
```

9. _Handle DEX swap from other ERC20 Token to ENSC Token_

```solidity
function Exchange_For_ENSC  ( address _tokenIn, uint256 _amountIn, uint256 _amountOut  ) public {}
```

10. _Handle DEX swap from ENSC Token to other ERC20 Token_

```solidity
function Exchange_From_ENSC ( ERC20 _tokenOut, uint256 _amountIn, uint256 _amountOut  ) public{}
```

11. _Withdraw contract balance_

```solidity
function withdrawBalance() external onlyOwner{}
```

12. _Contract fallback function_

```solidity
 receive() external payable {}
```
