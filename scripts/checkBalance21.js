require("dotenv").config(); // Đọc biến môi trường từ file .env

const Web3 = require("web3").Web3;
const web3 = new Web3(process.env.API_URL); // Kết nối Sepolia RPC

// const web3 = new Web3(
//   "https://eth-sepolia.g.alchemy.com/v2/GAmR4v-mpm5FSGrI8IvNZk3XSo8RbB-B"
// );

const { CONTRACT_ADDRESS } = require("../constant"); // Chứa địa chỉ contract

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
    // Lấy địa chỉ từ dòng lệnh
    const addressIndex = process.argv.indexOf("--address") + 1;
    if (addressIndex === 0 || !process.argv[addressIndex]) {
      throw new Error("Address not provided. Use --address <Ethereum_Address>");
    }

    const userAddress = process.argv[addressIndex];
    const tokenContractAddress = CONTRACT_ADDRESS.Token21.address;

    // Khởi tạo contract instance
    const contractInstance = new web3.eth.Contract(
      tokenABI,
      tokenContractAddress
    );

    // Lấy số dư của user
    const balance = await contractInstance.methods
      .balanceOf(userAddress)
      .call();

    // Chuyển đổi số dư từ wei về số token thực tế
    const readableBalance = web3.utils.fromWei(balance, "ether");

    console.log(`Token21 Balance of ${userAddress}: ${readableBalance} T21`);
  } catch (error) {
    console.error(
      "Error while checking Token21 balance:",
      error.message || error
    );
  }
}

// Chạy script
checkBalance21();
