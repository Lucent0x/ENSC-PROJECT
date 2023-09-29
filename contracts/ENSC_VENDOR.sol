//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// CA: 0xA839Ec1ad80a1DA38C1A3208738B2f64B38c266D
// USDC : 0x64544969ed7EBf5f083679233325356EbE738930
// USDT : 0x337610d27c682E347C9cD60BD4b3b107C9d34dDd

contract ENSC_Vendor {
    // The token being sold
    ERC20 public ENSC_Token;
    address public USDC;
    address public USDT;
    // Address where funds are collected
    address payable public ENSC_Wallet;

    // Amount of wei sold
    uint256 public weiSold;
    uint256 public USD_RATE;
    address payable public admin;

    /**
     * Event for token purchase logging
     */
    event TokenPurchase(
        address indexed purchaser,
        address indexed beneficiary,
        uint256 tokens
    );

    event TokenSwapped(
        address indexed vendor,
        address indexed beneficiary,
        uint256 tokens
    );

    // Whitelist of allowed tokens
    mapping(address => bool) public allowedTokens;
    //whitelist count
    uint256 public whitelistedTokenCount;
    /**
     * @param _wallet Address where collected funds will be forwarded to
     * @param _token Address of the token being sold
     */

    constructor(
        address payable _wallet,
        ERC20 _token,
        address _usdc,
        address _usdt,
        uint256 _usdRate
    ) {
        require(_wallet != address(0));
        ENSC_Wallet = _wallet;
        ENSC_Token = _token;
        USDT = _usdt;
        USDC = _usdc;
        USD_RATE = _usdRate;
        admin = payable(msg.sender);

        // Add USDT and USDC to the whitelist
        allowedTokens[USDT] = true;
        allowedTokens[USDC] = true;

        //intialize white listed token counts
        whitelistedTokenCount = 2;
    }

    modifier onlyOwner() {
        require(
            msg.sender == admin,
            "only contract deployer can call this function"
        );
        _;
    }

    // -----------------------------------------
    // ENSC vendor external || public interface
    // -----------------------------------------

    
    function addTokenToWhitelist(address tokenAddress) external onlyOwner {
        require(!allowedTokens[tokenAddress], "Token is already whitelisted");
        allowedTokens[tokenAddress] = true;
        whitelistedTokenCount++;
    }

    function removeTokenFromWhitelist(address tokenAddress) external onlyOwner {
        require(allowedTokens[tokenAddress], "Token is not whitelisted");
        allowedTokens[tokenAddress] = false;
        whitelistedTokenCount--;
    }

    function updateRate(uint256 _newRate) public onlyOwner {
        USD_RATE = _newRate;
    }

    function setUSDT(address _usdt) public onlyOwner {
        USDT = _usdt;
    }

    function setUSDC(address _usdt) public onlyOwner {
        USDT = _usdt;
    }

    /**
     * @dev low level token purchase ***DO NOT OVERRIDE***
     * @param _beneficiary Address performing the token purchase
     */
    function Buy_ENSC_Tokens_With_eNaira(address _beneficiary, uint256 _tokens)
        public
        payable
        onlyOwner
    {
        require(_tokens > 0, "Tokens amount too low");

        _preValidatePurchase(_beneficiary, _tokens);

        // update state
        weiSold += _tokens;

        _processPurchase(_beneficiary, _tokens);
        emit TokenPurchase(msg.sender, _beneficiary, _tokens);

        _updatePurchasingState(_beneficiary, _tokens);

        _forwardFunds();
        _postValidatePurchase(_beneficiary, _tokens);
    }

    function Buy_ENSC_Tokens_With_USDT(uint256 _amount) public payable {
        require(_amount > 0);
        // Check if the contract is approved to spend USDT on behalf of the sender
        require(
           ERC20( USDT).allowance(msg.sender, address(this)) >= _amount,
            "Insufficient USDT allowance"
        );

        // Transfer USDT from the user to ENSC WALLET
        require(
            ERC20(USDT).transferFrom(msg.sender, ENSC_Wallet, _amount),
            "Transfer of Token A failed"
        );

        //calculate amount of tokens to be allocated to the beneficiary.
        uint256 _tokens = _amount * USD_RATE;

        //Transfer ENSC tokens to user
        ENSC_Token.transferFrom(admin, msg.sender, _tokens);

        emit TokenPurchase(address(this), msg.sender, _tokens);
        // update state
        weiSold += _tokens;
    }

    function Buy_ENSC_Tokens_With_USDC(uint256 _amount) public payable {
        require(_amount > 0);
        // Check if the contract is approved to spend Token A on behalf of the sender
        require(
            ERC20(USDC).allowance(msg.sender, address(this)) >= _amount,
            "Insufficient allowance"
        );

        // Transfer Token USDC from the user to this ENSC Wallet
        require(
            ERC20(USDC).transferFrom(msg.sender, ENSC_Wallet, _amount),
            "Transfer of Token A failed"
        );

        //calculate amount of tokens to be allocated to the beneficiary.
        uint256 _tokens = _amount * USD_RATE;

        // Transfer ENSC tokens to user
        require(
            ENSC_Token.transferFrom(admin, msg.sender, _tokens),
            "Failed to send ENSC token to user"
        );
        
        emit TokenPurchase(address(this), msg.sender, _tokens);
        // update state
        weiSold += _tokens;
    }

    function Exchange_For_ENSC  ( address _tokenIn, uint256 _amountIn, uint256 _amountOut  ) public {
       
       //check if token is whiteListed
       require( allowedTokens[_tokenIn], "This token isn't whiteListed");
       
        //other requirements
        require ( _amountIn > 0, "amount in should be higer than 0");
        require ( _amountOut > 0, "amount out should be higer than 0");

        ERC20 coin = ERC20(_tokenIn);

        // Transaction clearances
        require(coin.allowance(msg.sender, address(this)) >= _amountIn,
         "Insufficient specified ERC20 Token allowance" );
         // Transfer ERC20 token to ENSC WALLET
        require( coin.transferFrom(msg.sender, ENSC_Wallet, _amountIn),
          "Failed to transfer in ");
          //Transfer ENSC Tokens to beneficiary
        require ( ENSC_Token.transferFrom(admin, msg.sender, _amountOut ),
         "Failed to transfer ENSC Tokens to beneficiary");  
        emit TokenPurchase(address(this), msg.sender, _amountOut);
        //update state
         weiSold += _amountOut;
    }


    function Exchange_From_ENSC ( ERC20 _tokenOut, uint256 _amountIn, uint256 _amountOut  ) public {
        //Clearances
        require ( _amountIn > 0, "ENSC tokens coming in should be greater than 0");
        require ( _amountOut > 0, "Amount of output token should be greater than zero");
        //Init token
        ERC20 coin = _tokenOut;
        //check if we have enough liquidity to pay beneficiary
        require(coin.balanceOf(ENSC_Wallet)>= _amountOut,
          "Inadequate liquidity for this trade");
        require(ENSC_Token.balanceOf(msg.sender) >= _amountIn);  
        require ( ENSC_Token.allowance(msg.sender, address(this)) >= _amountIn, 
        "Insufficeint ENSC Allowance");
        //withdraw ENSC
        require(ENSC_Token.transferFrom(msg.sender, ENSC_Wallet, _amountIn ),
         "Failed to withdraw ENSC from msg.sender");
         require(coin.allowance(ENSC_Wallet, address(this)) >= _amountOut,
         " Insufficient ERC20 Token allowance from ENSC Wallet ");
         // Finalise swap.
         require(coin.transferFrom(ENSC_Wallet, msg.sender, _amountOut), 
         "Failed to allocate ERC20 Token to the beneficiary");
        
        emit TokenSwapped(address(this), msg.sender, _amountOut);
         weiSold -= _amountOut;  
    }
    //Withdraw balance
        function withdrawBalance() external onlyOwner {
        uint256 balance = address(this).balance;
        ENSC_Wallet.transfer(balance);
        
    }


    receive() external payable {}

    // -----------------------------------------
    // Internal interface (extensible)
    // -----------------------------------------

    /**
     * @dev Validation of an incoming purchase. Use require statements to revert state when conditions are not met. Use super to concatenate validations.
     * @param _beneficiary Address performing the token purchase
     * @param _tokens Value in wei involved in the purchase
     */
    function _preValidatePurchase(address _beneficiary, uint256 _tokens)
        internal
        pure
    {
        require(_beneficiary != address(0));
        require(_tokens != 0);
    }

    /**
     * @dev Validation of an executed purchase. Observe state and use revert statements to undo rollback when valid conditions are not met.
     * @param _beneficiary Address performing the token purchase
     * @param _tokens Value in wei involved in the purchase
     */
    function _postValidatePurchase(address _beneficiary, uint256 _tokens)
        internal
    {
        // optional override
    }

    /**
     * @dev Source of tokens. Override this method to modify the way in which the crowdsale ultimately gets and sends its tokens.
     * @param _beneficiary Address performing the token purchase
     * @param _tokenAmount Number of tokens to be emitted
     */
    function _deliverTokens(address _beneficiary, uint256 _tokenAmount)
        internal
    {
        ENSC_Token.transferFrom(admin, _beneficiary, _tokenAmount);
    }

    /**
     * @dev Executed when a purchase has been validated and is ready to be executed. Not necessarily emits/sends tokens.
     * @param _beneficiary Address receiving the tokens
     * @param _tokenAmount Number of tokens to be purchased
     */
    function _processPurchase(address _beneficiary, uint256 _tokenAmount)
        internal
    {
        _deliverTokens(_beneficiary, _tokenAmount);
    }

    /**
     * @dev Override for extensions that require an internal state to check for validity (current user contributions, etc.)
     * @param _beneficiary Address receiving the tokens
     * @param _weiAmount Value in wei involved in the purchase
     */
    function _updatePurchasingState(address _beneficiary, uint256 _weiAmount)
        internal
    {
        // optional override
    }

    /**
     * @dev Determines how ETH is stored/forwarded on purchases.
     */
    function _forwardFunds() internal {
        ENSC_Wallet.transfer(msg.value);
    }

}