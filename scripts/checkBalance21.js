require("dotenv").config();

const Web3 = require("web3").Web3;
const web3 = new Web3(process.env.API_URL);

const { CONTRACT_ADDRESS } = require("../constant");

const tokenABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

async function checkBalance21() {
  try {
    const addressIndex = process.argv.indexOf("--address") + 1;
    if (addressIndex === 0 || !process.argv[addressIndex]) {
      throw new Error("Address not provided. Use --address <Ethereum_Address>");
    }

    const userAddress = process.argv[addressIndex];
    const tokenContractAddress = CONTRACT_ADDRESS.Token21.address;

    const contractInstance = new web3.eth.Contract(
      tokenABI,
      tokenContractAddress
    );

    const balance = await contractInstance.methods
      .balanceOf(userAddress)
      .call();

    const readableBalance = web3.utils.fromWei(balance, "ether");

    console.log(`Token21 Balance of ${userAddress}: ${readableBalance} T21`);
  } catch (error) {
    console.error(
      "Error while checking Token21 balance:",
      error.message || error
    );
  }
}

checkBalance21();
