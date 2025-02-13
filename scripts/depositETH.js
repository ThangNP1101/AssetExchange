require("dotenv").config(); // Đọc biến môi trường từ file .env

const Web3 = require("web3").Web3;
const web3 = new Web3(process.env.API_URL);

const { CONTRACT_ADDRESS } = require("../constant");

const contractABI = [
  {
    inputs: [],
    name: "depositETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
    payable: true,
  },
];

async function depositETH() {
  try {
    const addressIndex = process.argv.indexOf("--userAddress") + 1;
    const amountIndex = process.argv.indexOf("--amount") + 1;

    if (amountIndex === 0 || !process.argv[amountIndex]) {
      throw new Error("Deposit amount not provided. Use --amount <ETH_Value>");
    }
    if (addressIndex === 0 || !process.argv[addressIndex]) {
      throw new Error(
        "User address not provided. Use --userAddress <Ethereum_Address>"
      );
    }

    // Chuyển đổi số ETH sang Wei
    const depositAmount = web3.utils.toWei(process.argv[amountIndex], "ether");

    const contractAddress = CONTRACT_ADDRESS.AssertExchange.address; // Thay Token21 bằng contract cần gửi ETH
    const userAddress = process.argv[addressIndex];

    const contractInstance = new web3.eth.Contract(
      contractABI,
      contractAddress
    );

    // Gửi giao dịch depositETH
    const transaction = await contractInstance.methods.depositETH().send({
      from: userAddress,
      value: depositAmount,
      gas: 500000, // Giới hạn gas
    });

    console.log(`Deposit successful! Sent ${process.argv[amountIndex]} ETH`);
    console.log("Transaction receipt:", transaction);
  } catch (error) {
    console.error("Error while depositing ETH:", error);
  }
}

depositETH();
