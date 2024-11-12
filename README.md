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
npx hardhat verify --network sepolia 0xB77F002F4FcE14783fdCe03cA817c4C8a26D4d24 "Token1" "T1" "10000000000000000000000000"
https://sepolia.etherscan.io/address/0xB77F002F4FcE14783fdCe03cA817c4C8a26D4d24#code

npx hardhat ignition deploy ./ignition/modules/TestToken2Module.js --network sepolia
npx hardhat verify --network sepolia 0xB8eFD86853694b5C726Ba2bb83d7867047a0Ea11 "Token2" "T2" "10000000000000000000000000"
https://sepolia.etherscan.io/address/0xB8eFD86853694b5C726Ba2bb83d7867047a0Ea11#code

npx hardhat ignition deploy ./ignition/modules/TestToken3Module.js --network sepolia
npx hardhat verify --network sepolia 0x04eA28993Ecd7AB8C463cC2C11ed380484Fb7e69 "Token3" "T3" "10000000000000000000000000"
https://sepolia.etherscan.io/address/0x04eA28993Ecd7AB8C463cC2C11ed380484Fb7e69#code
