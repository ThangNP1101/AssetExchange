require("dotenv").config(); // Đọc biến môi trường từ file .env

const Web3 = require("web3").Web3;
const web3 = new Web3(process.env.API_URL);

const { CONTRACT_ADDRESS, USER_ADDRESS } = require("../constant");

// ABI của AssetExchange (chứa listPotatoForNFT)
const assetExchangeABI = [
  {
    inputs: [
      { internalType: "address", name: "tokenAddress", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "nftAddress", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "listPotatoForNFT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

async function listPotatoForNFT() {
  try {
    const userAddressIndex = process.argv.indexOf("--userAddress") + 1;
    const amountIndex = process.argv.indexOf("--amount") + 1;
    const tokenIdIndex = process.argv.indexOf("--tokenId") + 1;

    if (amountIndex === 0 || !process.argv[amountIndex]) {
      throw new Error("Amount not provided. Use --amount <Potato_Amount>");
    }
    if (tokenIdIndex === 0 || !process.argv[tokenIdIndex]) {
      throw new Error("Token ID not provided. Use --tokenId <NFT_ID>");
    }

    const amount = web3.utils.toWei(process.argv[amountIndex], "ether"); // Chuyển đổi amount sang Wei
    const tokenId = process.argv[tokenIdIndex];

    const userAddress = process.argv[userAddressIndex];
    const potatoAddress = CONTRACT_ADDRESS.Token21.address; // Địa chỉ token "Potato"
    const nftAddress = CONTRACT_ADDRESS.Token71.address; // Địa chỉ contract NFT

    console.log(
      `🔹 Listing ${web3.utils.fromWei(
        amount,
        "ether"
      )} Potato for NFT ID ${tokenId}...`
    );

    const assetExchangeContract = new web3.eth.Contract(
      assetExchangeABI,
      CONTRACT_ADDRESS.AssertExchange.address
    );

    // Gửi giao dịch listPotatoForNFT
    await assetExchangeContract.methods
      .listPotatoForNFT(potatoAddress, amount, nftAddress, tokenId)
      .send({ from: userAddress, gas: 500000 });

    console.log(
      `✅ Successfully listed ${web3.utils.fromWei(
        amount,
        "ether"
      )} Potato for NFT ID ${tokenId}!`
    );
  } catch (error) {
    console.error("🚨 Error while listing Potato for NFT:", error);
  }
}

// Chạy script
listPotatoForNFT();
