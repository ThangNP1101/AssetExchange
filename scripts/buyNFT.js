require("dotenv").config();
const Web3 = require("web3").Web3;

const web3 = new Web3(process.env.API_URL);
const { USER_ADDRESS, CONTRACT_ADDRESS } = require("../constant");

const assetExchangeABI = [
  {
    constant: false,
    inputs: [{ name: "id", type: "uint256" }],
    name: "buyNFT",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "id", type: "uint256" }],
    name: "basketNFTForETH",
    outputs: [
      { name: "tokenAddress", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "tokenURI", type: "string" },
      { name: "price", type: "uint256" },
      { name: "seller", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "user", type: "address" }],
    name: "balanceETH",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

async function buyNFT() {
  try {
    const buyerAddressIndex = process.argv.indexOf("--buyerAddress") + 1;
    const nftIdIndex = process.argv.indexOf("--nftId") + 1;

    if (buyerAddressIndex === 0 || !process.argv[buyerAddressIndex]) {
      throw new Error(
        "Buyer address not provided. Use --buyerAddress <Buyer_Address>"
      );
    }
    if (nftIdIndex === 0 || !process.argv[nftIdIndex]) {
      throw new Error("NFT ID not provided. Use --nftId <NFT_ID>");
    }

    const nftId = process.argv[nftIdIndex];
    const buyerAddress = process.argv[buyerAddressIndex];

    console.log(
      `🔹 Buying NFT with ID ${nftId} from address: ${buyerAddress}...`
    );

    // 🔗 Kết nối đến contract
    const assetExchangeContract = new web3.eth.Contract(
      assetExchangeABI,
      CONTRACT_ADDRESS.AssertExchange.address
    );

    // Kiểm tra NFT có tồn tại không
    const item = await assetExchangeContract.methods
      .basketNFTForETH(nftId)
      .call();
    if (item.tokenAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error("NFT not found!");
    }

    const sellerAddress = item.seller;
    const priceInWei = item.price;

    // Check buyer's balance
    const buyerBalance = await assetExchangeContract.methods
      .balanceETH(buyerAddress)
      .call();
    if (BigInt(buyerBalance) < BigInt(priceInWei)) {
      throw new Error("Insufficient ETH balance to buy NFT!");
    }

    // check seller's balance before the transaction
    const sellerBalanceBefore = await assetExchangeContract.methods
      .balanceETH(sellerAddress)
      .call();
    console.log(
      `Seller balance before sale: ${web3.utils.fromWei(
        sellerBalanceBefore,
        "ether"
      )} ETH`
    );

    // Thực hiện giao dịch mua NFT
    await assetExchangeContract.methods.buyNFT(nftId).send({
      from: buyerAddress,
      gas: 500000,
    });

    console.log(`Successfully purchased NFT ${nftId}!`);

    // check seller's balance after the transaction
    const sellerBalanceAfter = await assetExchangeContract.methods
      .balanceETH(sellerAddress)
      .call();
    console.log(
      `Seller balance after sale: ${web3.utils.fromWei(
        sellerBalanceAfter,
        "ether"
      )} ETH`
    );
  } catch (error) {
    console.error("Error while buying NFT:", error.message || error);
  }
}

buyNFT();
