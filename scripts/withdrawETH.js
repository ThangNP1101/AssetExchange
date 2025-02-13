require("dotenv").config(); // Đọc biến môi trường từ file .env

const Web3 = require("web3").Web3;
const web3 = new Web3(process.env.API_URL);

const { CONTRACT_ADDRESS, USER_ADDRESS } = require("../constant"); // Đảm bảo bạn có địa chỉ contract

// ABI của AssetExchange (chứa withdrawETH & balanceETH)
const assetExchangeABI = [
  {
    constant: false,
    inputs: [{ name: "amount", type: "uint256" }],
    name: "withdrawETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "account", type: "address" }],
    name: "balanceETH",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

async function withdrawETH() {
  try {
    // Lấy số ETH muốn rút từ command line
    const addressIndex = process.argv.indexOf("--userAddress") + 1;
    const amountIndex = process.argv.indexOf("--amount") + 1;

    if (addressIndex === 0 || !process.argv[addressIndex]) {
      throw new Error(
        "User address not provided. Use --userAddress <Ethereum_Address>"
      );
    }
    if (amountIndex === 0 || !process.argv[amountIndex]) {
      throw new Error(
        "Withdraw amount not provided. Use --amount <ETH_AMOUNT>"
      );
    }
    const userAddress = process.argv[addressIndex];
    const amountInEth = process.argv[amountIndex];
    const amountInWei = web3.utils.toWei(amountInEth, "ether");

    console.log(
      `🔹 Withdrawing ${amountInEth} ETH from address: ${userAddress}...`
    );

    // Kết nối đến contract
    const assetExchangeContract = new web3.eth.Contract(
      assetExchangeABI,
      CONTRACT_ADDRESS.AssertExchange.address
    );

    // Kiểm tra số dư trước khi rút
    const balanceWei = await assetExchangeContract.methods
      .balanceETH(userAddress)
      .call();
    if (BigInt(balanceWei) < BigInt(amountInWei)) {
      throw new Error("Insufficient ETH balance!");
    }

    // 📌 Gửi giao dịch rút ETH
    await assetExchangeContract.methods.withdrawETH(amountInWei).send({
      from: userAddress,
      gas: 500000,
    });

    console.log(`✅ Successfully withdrew ${amountInEth} ETH!`);
  } catch (error) {
    console.error("🚨 Error while withdrawing ETH:", error.message || error);
  }
}

// Chạy script
withdrawETH();
