const Token71 = artifacts.require("Token71");

module.exports = async function (deployer, network, accounts) {
  // Deploy Token71
  await deployer.deploy(Token71);
  const token71 = await Token71.deployed();
  console.log("Token71 deployed at:", token71.address);
};
