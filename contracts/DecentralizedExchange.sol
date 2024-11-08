// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "./Pool.sol";

contract DecentralizedExchange {
    mapping(address => mapping(address => Pool)) public getPair;
    address[] public allPairs;
    event PairCreated(address indexed token1, address indexed token2, address pair);

    error IdenticalAddressesAreNotAllowed();
    error PairAlreadyCreated();

    function createPairs(address token1, address token2, string calldata token1Name, string calldata token2Name) external returns(address) {
        // Checking
        require(token1 != token2, IdenticalAddressesAreNotAllowed());
        require(address(getPair[token1][token2]) == address(0), PairAlreadyCreated());

        // Creating liquidity pool
        string memory liquidityTokenName = string(abi.encodePacked("Liquidity-", token1Name, "-", token2Name));
        string memory liquiditySymbol = string(abi.encodePacked("LP-", token1Name, "-", token2Name));
        Pool pool = new Pool(token1, token2, liquidityTokenName, liquiditySymbol);

        // Updating state variable
        allPairs.push(address(pool));
        getPair[token1][token2] = pool;
        getPair[token2][token1] = pool;

        emit PairCreated(token1, token2, address(pool));

        return address(pool);
    }

    function allPairsLength() external view returns(uint256) {
        return allPairs.length;
    }
    
    function getPairs() external view returns(address[] memory) {
        return allPairs;
    }

    

}