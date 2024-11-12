# **Base Web3 Project**

compile : npx hardhat compiles

create a local node : npx hardhat node

test : npx hardhat test --network localhost

deploy : 
npx hardhat ignition deploy ./ignition/modules/DecentralizedExchangeModule.js --network sepolia

verify : 
npx hardhat verify --network sepolia 0x82B957A80277486a6c1D6C100B54f5a31e16610d

etherscan : https://sepolia.etherscan.io/address/0x82B957A80277486a6c1D6C100B54f5a31e16610d#code

Tests tokens : 

npx hardhat ignition deploy ./ignition/modules/TestToken1Module.js --network sepolia
npx hardhat verify --network sepolia 0x901d299316092Cb0573a765B2b04843CC1695E2F "Token1" "T1"
https://sepolia.etherscan.io/address/0x901d299316092Cb0573a765B2b04843CC1695E2F#code

npx hardhat ignition deploy ./ignition/modules/TestToken2Module.js --network sepolia
npx hardhat verify --network sepolia 0x5ae272f49C0510C340C34bdD376Ce41f63E03135 "Token2" "T2"
https://sepolia.etherscan.io/address/0x5ae272f49C0510C340C34bdD376Ce41f63E03135#code

npx hardhat ignition deploy ./ignition/modules/TestToken3Module.js --network sepolia
npx hardhat verify --network sepolia 0xa9d05a18713f28aAb9c304F75F4909dBBABD7cbc "Token3" "T3"
https://sepolia.etherscan.io/address/0xa9d05a18713f28aAb9c304F75F4909dBBABD7cbc#code
