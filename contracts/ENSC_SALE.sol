//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// CA: 0xA839Ec1ad80a1DA38C1A3208738B2f64B38c266D
contract ENSC_Sale {
    // The token being sold
    ERC20 public ENSC_Token;
    ERC20 public USDC;
    ERC20 public USDT;
    // Address where funds are collected
    address payable public ENSC_Wallet;

    // Amount of wei soldd
    uint256 public weiSold;
    uint256 public USD_RATE;
    address payable public admin;

    // mapping(address => bool) allowedTokens;

    /**
     * Event for token purchase logging
     */
    event TokenPurchase(
        address indexed purchaser,
        address indexed beneficiary,
        uint256 tokens
    );

    /**
     * @param _wallet Address where collected funds will be forwarded to
     * @param _token Address of the token being sold
     */

    constructor(
        address payable _wallet,
        ERC20 _token,
        ERC20 _usdt,
        ERC20 _usdc,
        uint256 _usdRate
    ) {
        require(_wallet != address(0));
        ENSC_Wallet = _wallet;
        ENSC_Token = _token;
        USDT = _usdt;
        USDC = _usdc;
        USD_RATE = _usdRate;
        admin = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(
            msg.sender == admin,
            "only contract deployer can call this function"
        );
        _;
    }

    // -----------------------------------------
    // ENSC sale external interface
    // -----------------------------------------

    /**
     * @dev fallback function ***DO NOT OVERRIDE***
     */

    function updateRate(uint256 _newRate) public onlyOwner {
        USD_RATE = _newRate;
    }

    function setUSDT(ERC20 _usdt) public onlyOwner {
        USDT = _usdt;
    }

    function setUSDC(ERC20 _usdt) public onlyOwner {
        USDT = _usdt;
    }

    receive() external payable {}

    /**
     * @dev low level token purchase ***DO NOT OVERRIDE***
     * @param _beneficiary Address performing the token purchase
     */
    function Buy_ENSC_Tokens_With_eNaira(
        address _beneficiary,
        uint256 _tokens
    ) public payable onlyOwner {
        require(_tokens > 0);

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
        // Check if the contract is approved to spend Token A on behalf of the sender
        require(
            USDT.allowance(msg.sender, address(this)) >= _amount,
            "Insufficient allowance"
        );

        // Transfer Token A from the user to this contract
        require(
            USDT.transferFrom(msg.sender, address(this), _amount),
            "Transfer of Token A failed"
        );

        //calculate amount of tokens to be allocated to the beneficiary.
        uint256 _tokens = _amount * USD_RATE;
        //swap tokens
        ENSC_Token.transferFrom(admin, msg.sender, _tokens);
        // update state
        weiSold += _tokens;
    }

    function Buy_ENSC_Tokens_With_USDC(uint256 _amount) public payable {
        require(_amount > 0);
        // Check if the contract is approved to spend Token A on behalf of the sender
        require(
            USDC.allowance(msg.sender, address(this)) >= _amount,
            "Insufficient allowance"
        );

        // Transfer Token A from the user to this contract
        require(
            USDC.transferFrom(msg.sender, address(this), _amount),
            "Transfer of Token A failed"
        );

        //calculate amount of tokens to be allocated to the beneficiary.
        uint256 _tokens = _amount * USD_RATE;
        //swap tokens
        ENSC_Token.transferFrom(admin, msg.sender, _tokens);
        // update state
        weiSold += _tokens;
    }

    // -----------------------------------------
    // Internal interface (extensible)
    // -----------------------------------------

    /**
     * @dev Validation of an incoming purchase. Use require statements to revert state when conditions are not met. Use super to concatenate validations.
     * @param _beneficiary Address performing the token purchase
     * @param _tokens Value in wei involved in the purchase
     */
    function _preValidatePurchase(
        address _beneficiary,
        uint256 _tokens
    ) internal pure {
        require(_beneficiary != address(0));
        require(_tokens != 0);
    }

    /**
     * @dev Validation of an executed purchase. Observe state and use revert statements to undo rollback when valid conditions are not met.
     * @param _beneficiary Address performing the token purchase
     * @param _tokens Value in wei involved in the purchase
     */
    function _postValidatePurchase(
        address _beneficiary,
        uint256 _tokens
    ) internal {
        // optional override
    }

    /**
     * @dev Source of tokens. Override this method to modify the way in which the crowdsale ultimately gets and sends its tokens.
     * @param _beneficiary Address performing the token purchase
     * @param _tokenAmount Number of tokens to be emitted
     */
    function _deliverTokens(
        address _beneficiary,
        uint256 _tokenAmount
    ) internal {
        ENSC_Token.transferFrom(admin, _beneficiary, _tokenAmount);
    }

    /**
     * @dev Executed when a purchase has been validated and is ready to be executed. Not necessarily emits/sends tokens.
     * @param _beneficiary Address receiving the tokens
     * @param _tokenAmount Number of tokens to be purchased
     */
    function _processPurchase(
        address _beneficiary,
        uint256 _tokenAmount
    ) internal {
        _deliverTokens(_beneficiary, _tokenAmount);
    }

    /**
     * @dev Override for extensions that require an internal state to check for validity (current user contributions, etc.)
     * @param _beneficiary Address receiving the tokens
     * @param _weiAmount Value in wei involved in the purchase
     */
    function _updatePurchasingState(
        address _beneficiary,
        uint256 _weiAmount
    ) internal {
        // optional override
    }

    /**
     * @dev Determines how ETH is stored/forwarded on purchases.
     */
    function _forwardFunds() internal {
        ENSC_Wallet.transfer(msg.value);
    }
}
