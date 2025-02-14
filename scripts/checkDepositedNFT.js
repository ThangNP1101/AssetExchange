require("dotenv").config();

const Web3 = require("web3").Web3;
const web3 = new Web3(process.env.API_URL);

const { CONTRACT_ADDRESS } = require("../constant");

const assertExchangeABI = [
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "balance721",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

const nftABI = [
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

async function checkNFTBalance() {
  try {
    const tokenIdIndex = process.argv.indexOf("--tokenId") + 1;

    if (tokenIdIndex === 0 || !process.argv[tokenIdIndex]) {
      throw new Error("Token ID not provided. Use --tokenId <NFT_ID>");
    }

    const tokenAddress = CONTRACT_ADDRESS.Token71.address;
    const tokenId = process.argv[tokenIdIndex];

    console.log(
      `Checking balance and ownership for NFT ID ${tokenId} from contract ${tokenAddress}...`
    );

    const assertExchangeContract = new web3.eth.Contract(
      assertExchangeABI,
      CONTRACT_ADDRESS.AssertExchange.address
    );

    const depositor = await assertExchangeContract.methods
      .balance721(tokenAddress, tokenId)
      .call();
    if (depositor !== "0x0000000000000000000000000000000000000000") {
      console.log(`NFT ${tokenId} was deposited by: ${depositor}`);
    } else {
      console.log(`NFT ${tokenId} is NOT deposited.`);
    }

    const nftContract = new web3.eth.Contract(nftABI, tokenAddress);

    const owner = await nftContract.methods.ownerOf(tokenId).call();
    console.log(`Current owner of NFT ${tokenId}: ${owner}`);
  } catch (error) {
    console.error("Error while checking balance721:", error);
  }
}

// Chạy script
checkNFTBalance();
