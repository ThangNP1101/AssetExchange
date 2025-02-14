require("dotenv").config();

const Web3 = require("web3").Web3;
const web3 = new Web3(process.env.API_URL);

const { CONTRACT_ADDRESS } = require("../constant");

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
    const tokenURIIndex = process.argv.indexOf("--uri") + 1;
    if (tokenURIIndex === 0 || !process.argv[tokenURIIndex]) {
      throw new Error("Token URI not provided. Use --uri <Token_URI>");
    }
    const tokenURI = process.argv[tokenURIIndex];

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("Missing private key. Set PRIVATE_KEY in the .env file.");
    }

    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);

    const tokenContractAddress = CONTRACT_ADDRESS.Token71.address;
    const contractInstance = new web3.eth.Contract(
      contractABI,
      tokenContractAddress
    );

    const tx = contractInstance.methods.mintToken(tokenURI);

    const gas = await tx.estimateGas({
      from: account.address,
      value: web3.utils.toWei("0.1", "ether"),
    });
    const gasPrice = await web3.eth.getGasPrice();

    const transaction = {
      from: account.address,
      to: tokenContractAddress,
      data: tx.encodeABI(),
      value: web3.utils.toWei("0.1", "ether"),
      gas,
      gasPrice,
    };

    const signedTx = await web3.eth.accounts.signTransaction(
      transaction,
      privateKey
    );

    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );

    console.log("Minting token successful!");
    console.log("Transaction hash:", receipt.transactionHash);
  } catch (error) {
    console.error("Error while minting token:", error);
  }
}

mintTokenForUser1();
