const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { network } = require("hardhat");

module.exports = buildModule("TestToken3Module", (m) => {

  const chainId = network.config.chainId;

  console.log("chainID : " + chainId);

  const decentralizedExchangeModuleContract = m.contract("TestToken", ["Token3", "T3"], { id: "artemis" });

  return { decentralizedExchangeModuleContract };
});
