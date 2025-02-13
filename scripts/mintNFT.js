require("dotenv").config(); // Đọc biến môi trường từ file .env

const Web3 = require("web3").Web3;
const web3 = new Web3(process.env.API_URL);

const { CONTRACT_ADDRESS, USER_ADDRESS } = require("../constant");

const contractABI = [
  {
    inputs: [{ internalType: "string", name: "tokenURI", type: "string" }],
    name: "mintToken",
    outputs: [],
    stateMutability: "payable",
    type: "function",
    payable: true,
  },
];

async function mintTokenForUser1() {
  try {
    const userAddressIndex = process.argv.indexOf("--userAddress") + 1;
    if (userAddressIndex === 0 || !process.argv[userAddressIndex]) {
      throw new Error(
        "User address not provided. Use --userAddress <User_Address>"
      );
    }
    const tokenURIIndex = process.argv.indexOf("--uri") + 1;
    if (tokenURIIndex === 0 || !process.argv[tokenURIIndex]) {
      throw new Error("Token URI not provided. Use --uri <Token_URI>");
    }
    const tokenURI = process.argv[tokenURIIndex];
    const tokenContractAddress = CONTRACT_ADDRESS.Token71.address;
    const userAddress = process.argv[userAddressIndex];
    const contractInstance = new web3.eth.Contract(
      contractABI,
      tokenContractAddress
    );
    const transaction = await contractInstance.methods
      .mintToken(tokenURI)
      .send({
        from: userAddress,
        value: web3.utils.toWei("0.1", "ether"), // Ensure the value matches the PRICE in the contract
        gas: 500000, // Gas limit
      });

    console.log("Minting token successful!");
    // console.log("Transaction receipt:", transaction);
  } catch (error) {
    console.error("Error while minting token:", error);
  }
}

mintTokenForUser1();
