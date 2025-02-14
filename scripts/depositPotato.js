require("dotenv").config();

const Web3 = require("web3").Web3;
const web3 = new Web3(process.env.API_URL);

const { CONTRACT_ADDRESS, USER_ADDRESS } = require("../constant");

const contractABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "depositPotato",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

async function depositPotato() {
  try {
    const userAddressIndex = process.argv.indexOf("--userAddress") + 1;
    const amountIndex = process.argv.indexOf("--amount") + 1;

    if (userAddressIndex === 0 || !process.argv[userAddressIndex]) {
      throw new Error(
        "User address not provided. Use --userAddress <Ethereum_Address>"
      );
    }
    if (amountIndex === 0 || !process.argv[amountIndex]) {
      throw new Error("Amount not provided. Use --amount <Deposit_Amount>");
    }

    const tokenAddress = CONTRACT_ADDRESS.Token21.address;
    const amount = process.argv[amountIndex];

    console.log(`Depositing ${amount} tokens from ${tokenAddress}...`);

    const contractAddress = CONTRACT_ADDRESS.AssertExchange.address;
    const contractInstance = new web3.eth.Contract(
      contractABI,
      contractAddress
    );

    const sender = process.argv[userAddressIndex] || USER_ADDRESS.user1.address;

    const erc20ABI = [
      {
        constant: false,
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ];

    const tokenContract = new web3.eth.Contract(erc20ABI, tokenAddress);
    const allowance = await tokenContract.methods
      .approve(contractAddress, amount * 10 ** 18)
      .send({ from: sender });

    if (!allowance) {
      throw new Error(
        "Approval failed. Please check your token balance and allowance."
      );
    }

    console.log("Approval successful. Proceeding with deposit...");

    const tx = await contractInstance.methods
      .depositPotato(tokenAddress, amount)
      .send({ from: sender });

    console.log(`Deposit successful! Transaction Hash: ${tx.transactionHash}`);
  } catch (error) {
    console.error("Error while depositing tokens:", error);
  }
}

depositPotato();
