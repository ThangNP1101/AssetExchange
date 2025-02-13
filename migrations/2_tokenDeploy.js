// const Token71 = artifacts.require("Token71");
const Token21 = artifacts.require("Token21");

module.exports = async function (deployer, network, accounts) {
  //   // Deploy Token71
  //   await deployer.deploy(Token71);
  //   const token71 = await Token71.deployed();
  //   console.log("Token71 deployed at:", token71.address);

  // Deploy Token21
  await deployer.deploy(Token21);
  const token21 = await Token21.deployed();
  console.log("Token21 deployed at:", token21.address);
};
