require("dotenv").config();

const Web3 = require("web3").Web3;
const web3 = new Web3(process.env.API_URL);

const { CONTRACT_ADDRESS, USER_ADDRESS } = require("../constant");

const assetExchangeABI = [
  {
    constant: false,
    inputs: [
      { name: "tokenAddress", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "price", type: "uint256" },
    ],
    name: "listNFTForETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

async function listNFT() {
  try {
    const userAddressIndex = process.argv.indexOf("--userAddress") + 1;
    const tokenIdIndex = process.argv.indexOf("--tokenId") + 1;
    const priceIndex = process.argv.indexOf("--price") + 1;

    if (userAddressIndex === 0 || !process.argv[userAddressIndex]) {
      throw new Error(
        "User address not provided. Use --userAddress <User_Address>"
      );
    }
    if (tokenIdIndex === 0 || !process.argv[tokenIdIndex]) {
      throw new Error("Token ID not provided. Use --tokenId <NFT_ID>");
    }
    if (priceIndex === 0 || !process.argv[priceIndex]) {
      throw new Error("Price not provided. Use --price <Price_in_ETH>");
    }

    const userAddress = process.argv[userAddressIndex];
    const tokenAddress = CONTRACT_ADDRESS.Token71.address;
    const tokenId = process.argv[tokenIdIndex];
    const priceInETH = process.argv[priceIndex];
    const priceInWei = web3.utils.toWei(priceInETH, "ether");

    console.log(
      `🔹 Listing NFT (ID: ${tokenId}) from contract ${tokenAddress} for ${priceInETH} ETH by ${userAddress} (${priceInWei} Wei)...`
    );

    const assetExchangeContract = new web3.eth.Contract(
      assetExchangeABI,
      CONTRACT_ADDRESS.AssertExchange.address
    );

    console.log(`🔹 Listing NFT ${tokenId} for sale at ${priceInETH} ETH...`);
    await assetExchangeContract.methods
      .listNFTForETH(tokenAddress, tokenId, priceInWei)
      .send({ from: userAddress, gas: 500000 });

    console.log(`✅ NFT ${tokenId} successfully listed for ${priceInETH} ETH!`);
  } catch (error) {
    console.error("🚨 Error while listing NFT for ETH:", error);
  }
}

listNFT();
