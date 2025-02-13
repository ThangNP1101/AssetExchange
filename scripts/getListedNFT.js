require("dotenv").config(); // Đọc biến môi trường từ file .env

const Web3 = require("web3").Web3;
const web3 = new Web3(process.env.API_URL);

const { CONTRACT_ADDRESS } = require("../constant");

// ABI của contract chứa basketNFTForETH
const assetExchangeABI = [
  {
    constant: true,
    inputs: [{ name: "nftCounter", type: "uint256" }],
    name: "basketNFTForETH",
    outputs: [
      { name: "tokenAddress", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "tokenURI", type: "string" },
      { name: "price", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

async function getListedNFTs() {
  try {
    console.log("🔹 Fetching listed NFTs...");

    // Kết nối contract
    const assetExchangeContract = new web3.eth.Contract(
      assetExchangeABI,
      CONTRACT_ADDRESS.AssertExchange.address
    );

    let nftCounter = 0; // Giả sử bắt đầu từ 0, cần kiểm tra giá trị thực tế từ contract
    let listedNFTs = [];

    while (true) {
      try {
        const nft = await assetExchangeContract.methods
          .basketNFTForETH(nftCounter)
          .call();
        if (
          !nft.tokenAddress ||
          nft.tokenAddress === "0x0000000000000000000000000000000000000000"
        ) {
          break; // Nếu gặp slot rỗng, kết thúc vòng lặp
        }

        listedNFTs.push({
          tokenAddress: nft.tokenAddress,
          tokenId: nft.tokenId,
          tokenURI: nft.tokenURI,
          price: web3.utils.fromWei(nft.price, "ether") + " ETH",
        });

        nftCounter++;
      } catch (error) {
        console.log(
          `🚨 Error fetching NFT at index ${nftCounter}:`,
          error.message
        );
        break;
      }
    }

    console.log(
      "✅ Listed NFTs:",
      listedNFTs.length > 0 ? listedNFTs : "No NFTs listed."
    );
  } catch (error) {
    console.error("🚨 Error fetching listed NFTs:", error);
  }
}

// Chạy script
getListedNFTs();
