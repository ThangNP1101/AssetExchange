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
    type: "function",
  },
];

async function checkBalance71() {
  try {
    const addressIndex = process.argv.indexOf("--address") + 1;
    if (addressIndex === 0 || !process.argv[addressIndex]) {
      throw new Error("Address not provided. Use --address <Ethereum_Address>");
    }

    const address = process.argv[addressIndex];
    const tokenContractAddress = CONTRACT_ADDRESS.Token71.address;
    const contractInstance = new web3.eth.Contract(
      tokenABI,
      tokenContractAddress
    );
    const balance = await contractInstance.methods.balanceOf(address).call();
    console.log(`Token71 Balance of ${address}:`, balance);
  } catch (error) {
    console.error("Error while checking Token71 balance:", error);
  }
}

checkBalance71();
