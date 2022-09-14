//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol"; 

contract TestERC20 is ERC20{
    constructor ( string memory name, string memory symbol, uint256 token_mint) ERC20(name, symbol) {
        _mint(msg.sender, token_mint);
    }

}