require("dotenv").config();

const Web3 = require("web3").Web3;
const web3 = new Web3(process.env.API_URL);

const { CONTRACT_ADDRESS, USER_ADDRESS } = require("../constant");

const contractABI = [
  {
    constant: false,
    inputs: [
      { name: "tokenAddress", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "withdrawERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "tokenAddress", type: "address" },
      { name: "account", type: "address" },
    ],
    name: "balance20",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

async function withdrawERC20() {
  try {
    const userAddress = USER_ADDRESS.user3.address;
    const tokenAddress = CONTRACT_ADDRESS.Token21.address;
    const amountIndex = process.argv.indexOf("--amount") + 1;
    if (!tokenAddress || !process.argv[amountIndex]) {
      throw new Error(
        "Token address or amount not provided. Use --amount <AMOUNT>"
      );
    }

    const amount = process.argv[amountIndex];
    const amountInWei = web3.utils.toWei(amount, "ether");

    console.log(
      `🔹 Withdrawing ${amount} tokens from address: ${userAddress}...`
    );

    const contract = new web3.eth.Contract(
      contractABI,
      CONTRACT_ADDRESS.AssertExchange.address
    );

    const balanceWei = await contract.methods
      .balance20(tokenAddress, userAddress)
      .call();
    if (BigInt(balanceWei) < BigInt(amountInWei)) {
      throw new Error("Insufficient token balance!");
    }

    await contract.methods.withdrawERC20(tokenAddress, amountInWei).send({
      from: userAddress,
      gas: 500000,
    });

    console.log(`✅ Successfully withdrew ${amount} tokens!`);
  } catch (error) {
    console.error("🚨 Error while withdrawing tokens:", error.message || error);
  }
}

withdrawERC20();
