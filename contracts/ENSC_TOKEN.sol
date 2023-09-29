//SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract ENSC_ENERGY is ERC20Capped {
    address payable public owner;

    constructor()
        ERC20("ENSC ENERGY", "ENSC")
        ERC20Capped(20000000000 * (10 ** decimals()))
    {
        owner = payable(msg.sender);
        _mint(owner, 20000000000 * (10 ** decimals()));
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
