require("dotenv").config(); // Đọc biến môi trường từ file .env

const Web3 = require("web3").Web3;
const web3 = new Web3(process.env.API_URL);

const { CONTRACT_ADDRESS } = require("../constant");

// ABI của smart contract
const nftABI = [
  {
    inputs: [
      { internalType: "address", name: "tokenAddress", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "depositNFT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getApproved",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

async function depositNFT() {
  try {
    const userAddressIndex = process.argv.indexOf("--userAddress") + 1;
    const tokenIdIndex = process.argv.indexOf("--tokenId") + 1;

    if (userAddressIndex === 0 || !process.argv[userAddressIndex]) {
      throw new Error(
        "User address not provided. Use --userAddress <User_Address>"
      );
    }

    if (tokenIdIndex === 0 || !process.argv[tokenIdIndex]) {
      throw new Error("Token ID not provided. Use --tokenId <NFT_ID>");
    }

    const userAddress = process.argv[userAddressIndex];
    const tokenAddress = CONTRACT_ADDRESS.Token71.address;
    const tokenId = process.argv[tokenIdIndex];

    console.log(
      `Depositing NFT (ID: ${tokenId}) from contract ${tokenAddress}...`
    );

    const contractAdress = CONTRACT_ADDRESS.AssertExchange.address;

    const nftContract = new web3.eth.Contract(nftABI, tokenAddress);

    // Kiểm tra chủ sở hữu NFT
    const owner = await nftContract.methods.ownerOf(tokenId).call();
    console.log(`Current owner of NFT ${tokenId}: ${owner}`);

    if (owner.toLowerCase() !== userAddress.toLowerCase()) {
      throw new Error(
        `You are not the owner of this NFT! Current owner: ${owner}`
      );
    }

    console.log(`Approving contract to manage NFT ${tokenId}...`);
    await nftContract.methods
      .approve(contractAdress, tokenId)
      .send({ from: userAddress, gas: 500000 });

    const approvedAddress = await nftContract.methods
      .getApproved(tokenId)
      .call();
    console.log(`Approved address for NFT ${tokenId}: ${approvedAddress}`);

    if (approvedAddress.toLowerCase() !== contractAdress.toLowerCase()) {
      throw new Error(
        "Approval failed! Contract is not approved to transfer this NFT."
      );
    }

    console.log(`Approval successful! Depositing NFT...`);

    const contract = new web3.eth.Contract(nftABI, contractAdress);
    await contract.methods
      .depositNFT(tokenAddress, tokenId)
      .send({ from: userAddress, gas: 500000 });

    console.log(`NFT ${tokenId} deposited successfully!`);
  } catch (error) {
    console.error("Error while depositing NFT:", error);
  }
}

// Chạy script
depositNFT();
