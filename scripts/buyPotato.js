const { Web3 } = require("web3");
const web3 = new Web3("http://127.0.0.1:7545"); // Kết nối Ganache
const { USER_ADDRESS, CONTRACT_ADDRESS } = require("../constant");

const assetExchangeABI = [
  {
    constant: false,
    inputs: [{ name: "id", type: "uint256" }],
    name: "buyPotatoByNFT",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "id", type: "uint256" }],
    name: "basketPotatoForNFT",
    outputs: [
      { name: "seller", type: "address" },
      { name: "tokenAddress", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "nftAddress", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

async function buyPotato() {
  try {
    const buyerAddressIndex = process.argv.indexOf("--buyerAddress") + 1;
    const basketIdIndex = process.argv.indexOf("--basketId") + 1;

    if (buyerAddressIndex === 0 || !process.argv[buyerAddressIndex]) {
      throw new Error(
        "Buyer address not provided. Use --buyerAddress <Ethereum_Address>"
      );
    }
    if (!process.argv[basketIdIndex]) {
      throw new Error(
        "Basket Id not provided in the arguments. Use --basketId <Basket_ID>"
      );
    }

    const buyerAddress = process.argv[buyerAddressIndex];
    const basketId = process.argv[basketIdIndex];

    console.log(
      `🔹 Buying Potato in basket with ID = ${basketId} from address: ${buyerAddress}...`
    );

    const assetExchangeContract = new web3.eth.Contract(
      assetExchangeABI,
      CONTRACT_ADDRESS.AssertExchange.address
    );

    // Check basket
    const item = await assetExchangeContract.methods
      .basketPotatoForNFT(basketId)
      .call();
    if (item.tokenAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error("Potato basket not found!");
    }

    console.log("✅ Line 53 finised");

    const sellerAddress = item.seller;
    console.log(`Seller address is: ${sellerAddress}`);
    const nftAddress = item.nftAddress;
    console.log(`NFT address is: ${nftAddress}`);
    const tokenId = item.tokenId;
    console.log(`Token Id is: ${tokenId}`);
    console.log(`Token amount is: ${item.amount}`);

    const nftABI = [
      {
        inputs: [
          { internalType: "address", name: "", type: "address" },
          { internalType: "uint256", name: "", type: "uint256" },
        ],
        name: "balance721",
        outputs: [{ internalType: "address", name: "", type: "address" }], // Trả về địa chỉ thay vì bool
        stateMutability: "view",
        type: "function",
      },
    ];

    const nftContract = new web3.eth.Contract(
      nftABI,
      CONTRACT_ADDRESS.AssertExchange.address
    );

    console.log("✅ Checking NFT ownership...");
    const nftDepositor = await nftContract.methods
      .balance721(nftAddress, tokenId)
      .call();
    console.log(`✅ NFT depositor was: ${nftDepositor}`);
    if (nftDepositor.toLowerCase() !== buyerAddress.toLowerCase()) {
      throw new Error("Buyer does not own the required NFT!");
    }

    console.log("✅ All conditions met. Processing transaction...");

    await assetExchangeContract.methods.buyPotatoByNFT(basketId).send({
      from: buyerAddress,
      gas: 500000,
    });

    console.log(`🎉 Successfully purchased ${amount} Potato!`);
  } catch (error) {
    console.error("🚨 Error while buying Potato:", error);
  }
}

buyPotato();
