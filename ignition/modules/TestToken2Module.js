const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { network } = require("hardhat");

module.exports = buildModule("TestToken2Module", (m) => {

  const chainId = network.config.chainId;

  console.log("chainID : " + chainId);

  const decentralizedExchangeModuleContract = m.contract("TestToken", ["Token2", "T2", "1000000000000000000000"], { id: "artemis" });

  return { decentralizedExchangeModuleContract };
});
