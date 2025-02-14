require("dotenv").config();

const Web3 = require("web3").Web3;
const web3 = new Web3(process.env.API_URL);

const { CONTRACT_ADDRESS, USER_ADDRESS } = require("../constant");

const tokenABI = [
  {
    constant: false,
    inputs: [{ name: "amount", type: "uint256" }],
    name: "buyToken",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

async function buyToken() {
  try {
    const addressIndex = process.argv.indexOf("--userAddress") + 1;
    const amountIndex = process.argv.indexOf("--amount") + 1;

    if (addressIndex === 0 || !process.argv[addressIndex]) {
      throw new Error(
        "❌ Address not provided. Use --userAddress <Ethereum_Address>"
      );
    }
    if (amountIndex === 0 || !process.argv[amountIndex]) {
      throw new Error("❌ Amount not provided. Use --amount <Number>");
    }

    const userAddress = process.argv[addressIndex];
    const tokenAmount = BigInt(process.argv[amountIndex]); // Số lượng token muốn mua

    const tokenContractAddress = CONTRACT_ADDRESS.Token21.address;
    const contractInstance = new web3.eth.Contract(
      tokenABI,
      tokenContractAddress
    );

    const PRICE_PER_TOKEN = BigInt(web3.utils.toWei("0.0004", "ether"));
    const totalCost = PRICE_PER_TOKEN * tokenAmount;

    console.log(
      `Buying ${tokenAmount} Token21 for ${web3.utils.fromWei(
        totalCost.toString(),
        "ether"
      )} ETH...`
    );

    const userBalance = await web3.eth.getBalance(userAddress);
    if (BigInt(userBalance) < totalCost) {
      throw new Error(
        `Insufficient ETH! You have ${web3.utils.fromWei(
          userBalance,
          "ether"
        )} ETH but need ${web3.utils.fromWei(
          totalCost.toString(),
          "ether"
        )} ETH.`
      );
    }

    const tx = await contractInstance.methods.buyToken(tokenAmount).send({
      from: userAddress,
      value: totalCost.toString(),
      gas: 300000,
    });

    console.log(`✅ Successfully bought ${tokenAmount} Token21!`);
    console.log(`🔗 Transaction Hash: ${tx.transactionHash}`);

    const newBalance = await contractInstance.methods
      .balanceOf(userAddress)
      .call();
    const newBalanceInEther = web3.utils.fromWei(newBalance, "ether");
    console.log(
      `💰 New Token21 Balance of ${userAddress}: ${newBalanceInEther} T21`
    );
  } catch (error) {
    console.error("❌ Error while buying Token21:", error.message || error);
  }
}

buyToken();
