require("dotenv").config();

const Web3 = require("web3").Web3;
const web3 = new Web3(process.env.API_URL);

const { CONTRACT_ADDRESS } = require("../constant");

const assetExchangeABI = [
  {
    constant: true,
    inputs: [{ name: "potatoCounter", type: "uint256" }],
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

async function getListedPotato() {
  try {
    console.log("🔹 Fetching listed Potato-for-NFT swaps...");

    const assetExchangeContract = new web3.eth.Contract(
      assetExchangeABI,
      CONTRACT_ADDRESS.AssertExchange.address
    );

    let potatoCounter = 0;
    let listedPotatoes = [];
    while (true) {
      try {
        const potato = await assetExchangeContract.methods
          .basketPotatoForNFT(potatoCounter)
          .call();
        if (
          !potato.tokenAddress ||
          potato.tokenAddress === "0x0000000000000000000000000000000000000000"
        ) {
          break;
        }

        listedPotatoes.push({
          seller: potato.seller,
          tokenAddress: potato.tokenAddress,
          amount: web3.utils.fromWei(potato.amount, "ether") + " Potato",
          nftAddress: potato.nftAddress,
          tokenId: potato.tokenId,
        });
        console.log("🔹 Line 50 finished");

        potatoCounter++;
      } catch (error) {
        console.log(
          `🚨 Error fetching Potato at index ${potatoCounter}:`,
          error.message
        );
        break;
      }
    }

    console.log(
      "✅ Listed Potato-for-NFT swaps:",
      listedPotatoes.length > 0 ? listedPotatoes : "No Potato listings found."
    );
  } catch (error) {
    console.error("🚨 Error fetching listed Potato-for-NFT swaps:", error);
  }
}

getListedPotato();
