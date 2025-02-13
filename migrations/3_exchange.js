const AssertExchange = artifacts.require("AssertExchange");

module.exports = async function (deployer, network, accounts) {
  // Deploy AssertExchange
  await deployer.deploy(AssertExchange);
  const market = await AssertExchange.deployed();
  console.log("AssertExchange deployed at:", market.address);
};
