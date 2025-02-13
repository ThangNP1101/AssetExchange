require("dotenv").config(); // Đọc biến môi trường từ file .env

const Web3 = require("web3").Web3;
const web3 = new Web3(process.env.API_URL);

const { CONTRACT_ADDRESS } = require("../constant"); // Import địa chỉ contract

// ABI của contract (chứa balance20)
const contractABI = [
  {
    inputs: [
      { internalType: "address", name: "tokenAddress", type: "address" },
      { internalType: "address", name: "userAddress", type: "address" },
    ],
    name: "balance20",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

async function checkDepositedPotato() {
  try {
    // Lấy tham số từ dòng lệnh
    const userAddressIndex = process.argv.indexOf("--userAddress") + 1;

    if (userAddressIndex === 0 || !process.argv[userAddressIndex]) {
      throw new Error(
        "User address not provided. Use --userAddress <User_Wallet_Address>"
      );
    }

    const tokenAddress = CONTRACT_ADDRESS.Token21.address;
    const userAddress = process.argv[userAddressIndex];

    console.log(
      `Checking deposited balance for user ${userAddress} and token ${tokenAddress}...`
    );

    // Kết nối đến contract
    const contractInstance = new web3.eth.Contract(
      contractABI,
      CONTRACT_ADDRESS.AssertExchange.address
    );

    // Gọi hàm balance20 để lấy số dư
    const balanceWei = await contractInstance.methods
      .balance20(tokenAddress, userAddress)
      .call();
    const balanceEther = web3.utils.fromWei(balanceWei, "ether");

    console.log(
      `Deposited balance: ${balanceEther} tokens (${balanceWei} wei)`
    );
  } catch (error) {
    console.error("Error while checking deposited balance:", error);
  }
}

// Chạy script
checkDepositedPotato();
