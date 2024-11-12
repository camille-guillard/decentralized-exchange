// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract TestToken is ERC20 {

    constructor(string memory _tokenName, string memory _tokenSymbol, uint _ownerSupply) ERC20(_tokenName, _tokenSymbol) {
        _mint(msg.sender, _ownerSupply);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}