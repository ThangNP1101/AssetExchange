require("dotenv").config();

const Web3 = require("web3").Web3;
const web3 = new Web3(process.env.API_URL);

async function checkEthBalance() {
  try {
    const addressIndex = process.argv.indexOf("--address") + 1;
    if (addressIndex === 0 || !process.argv[addressIndex]) {
      throw new Error("Address not provided. Use --address <Ethereum_Address>");
    }

    const address = process.argv[addressIndex];
    const balance = await web3.eth.getBalance(address);
    console.log(
      `ETH Balance of ${address}:`,
      web3.utils.fromWei(balance, "ether"),
      "ETH"
    );
  } catch (error) {
    console.error("Error while checking ETH balance:", error);
  }
}

checkEthBalance();
