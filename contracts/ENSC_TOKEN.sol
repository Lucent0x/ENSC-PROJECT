//SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract ENSC_ENERGY is ERC20  {

    address payable public Advisors;
    address payable public DevelopmentFund;
    uint256 public Ecosystem;
    uint256 public Liquidity;
    address payable public Marketing;
    address payable public owner;
    address payable public RnD;
    address payable public Team;
    
    constructor( 
        address _advisor,
         address _developmentFund, 
         address _marketing,
         address _rnd,
          address _team
           ) ERC20("ENSC ENERGY", "ENSC") {
        Advisors = payable(_advisor);
        DevelopmentFund = payable(_developmentFund);
        Ecosystem = 12000000000;
        Liquidity = 800000000;
        Marketing = payable(_marketing);
        RnD = payable(_rnd );
        Team = payable(_team);
        Advisors = payable(_advisor);
        owner = payable(msg.sender);

        //begin allocation
        _mint(Advisors, 600000000 * (10 ** decimals()));
        _mint(Marketing, 800000000 * (10 ** decimals()));
        _mint(RnD, 800000000 * (10 ** decimals()));
        _mint(Team, 4000000000 * (10 ** decimals()));
        //64% for initial supply
        _mint(owner, Ecosystem * (10 ** decimals()));
        _mint(owner, Liquidity * (10 ** decimals()));
    }

    function mint(uint amount) public onlyOwner {
        _mint(owner, amount * (10 ** decimals()));
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount * (10 ** decimals()));
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only this smart contract deployer only can call this function!"
        );
        _;
    }

    //fallback
    receive() external payable {}
}
