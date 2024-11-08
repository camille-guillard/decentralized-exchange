const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { network } = require("hardhat");

module.exports = buildModule("TestToken1Module", (m) => {

  const chainId = network.config.chainId;

  console.log("chainID : " + chainId);

  const decentralizedExchangeModuleContract = m.contract("TestToken", ["Token1", "T1"], { id: "artemis" });

  return { decentralizedExchangeModuleContract };
});
