const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { network } = require("hardhat");

module.exports = buildModule("DecentralizedExchangeModule", (m) => {

  const chainId = network.config.chainId;

  console.log("chainID : " + chainId);

  const decentralizedExchangeModuleContract = m.contract("DecentralizedExchange", [], { id: "artemis4" });

  return { decentralizedExchangeModuleContract };
});
