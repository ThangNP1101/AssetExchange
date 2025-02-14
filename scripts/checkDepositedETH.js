require("dotenv").config();

const Web3 = require("web3").Web3;
const web3 = new Web3(process.env.API_URL);

const { CONTRACT_ADDRESS, USER_ADDRESS } = require("../constant");

const assetExchangeABI = [
  {
    constant: true,
    inputs: [{ name: "account", type: "address" }],
    name: "balanceETH",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

async function checkDepositedETH() {
  try {
    const addressIndex = process.argv.indexOf("--userAddress") + 1;
    if (addressIndex === 0 || !process.argv[addressIndex]) {
      throw new Error(
        "User address not provided. Use --userAddress <Ethereum_Address>"
      );
    }
    const userAddress = process.argv[addressIndex];

    console.log(`🔹 Checking deposited ETH for address: ${userAddress}...`);

    const assetExchangeContract = new web3.eth.Contract(
      assetExchangeABI,
      CONTRACT_ADDRESS.AssertExchange.address
    );

    const balance = await assetExchangeContract.methods
      .balanceETH(userAddress)
      .call();

    console.log(
      `✅ Deposited ETH: ${web3.utils.fromWei(balance, "ether")} ETH`
    );
  } catch (error) {
    console.error("🚨 Error while checking deposited ETH:", error);
  }
}

checkDepositedETH();
