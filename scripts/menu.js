const inquirer = require("inquirer");
const { exec } = require("child_process");

const runScript = (command) => {
  console.log(`Executing: ${command}`);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return mainMenu();
    }
    if (stderr) {
      console.error(`⚠ stderr: ${stderr}`);
    }
    console.log(`✅ stdout: ${stdout}`);
    mainMenu();
  });
};

const mainMenu = async () => {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "script",
      message: "Which script do you want to run?",
      choices: [
        { name: "Mint NFT", value: "mintNFT" },
        { name: "Deposit NFT", value: "depositNFT" },
        { name: "Deposit ETH", value: "depositETH" },
        { name: "List NFT for ETH", value: "listNFTForETH" }, // Thêm chức năng list NFT
        { name: "Get listed NFTs", value: "getListedNFT" }, // Thêm chức năng lấy danh sách NFT đã list
        { name: "Buy NFT", value: "buyNFT" }, // Thêm chức năng mua NFT
        { name: "Get token 20 for free", value: "getToken20" }, // Thêm chức năng nhận token 20 miễn phí
        { name: "Check balance ETH", value: "checkBalanceETH" }, // Thêm chức năng kiểm tra số dư ETH
        { name: "Check balance Potato", value: "checkBalance21" }, // Thêm chức năng kiểm tra số dư Potato
        { name: "Withdraw ETH", value: "withdrawETH" }, // Thêm chức năng rút ETH
        { name: "Check balance deposited ETH", value: "checkDepositedETH" }, // Thêm chức năng kiểm tra số dư ETH đã gửi
        { name: "Deposit Potato", value: "depositPotato" }, // Thêm chức năng deposit potato
        { name: "List Potato for NFT", value: "listPotatoForNFT" }, // Thêm chức năng list Potato
        { name: "Get listed Potato", value: "getListedPotato" }, // Thêm chức năng lấy danh sách Potato đã list
        { name: "Buy Potato", value: "buyPotato" }, // Thêm chức năng mua Potato
        { name: "Deposit NFT", value: "depositNFT" },
        { name: "Exit", value: "exit" },
      ],
    },
  ]);

  if (answers.script === "exit") {
    console.log("👋 Goodbye!");
    return;
  }

  if (answers.script === "mintNFT") {
    const mintNFTAnswers = await inquirer.prompt([
      {
        type: "input",
        name: "userAddress",
        message: "Enter the user address:",
      },
      { type: "input", name: "uri", message: "Enter the token URI:" },
    ]);
    const command = `node mintNFT.js --userAddress ${mintNFTAnswers.userAddress} --uri ${mintNFTAnswers.uri}`;
    runScript(command);
  } else if (answers.script === "depositNFT") {
    const depositNFTAnswers = await inquirer.prompt([
      {
        type: "input",
        name: "userAddress",
        message: "Enter the user address:",
      },
      { type: "input", name: "tokenId", message: "Enter the token ID:" },
    ]);
    const command = `node depositNFT.js --userAddress ${depositNFTAnswers.userAddress} --tokenId ${depositNFTAnswers.tokenId}`;
    runScript(command);
  } else if (answers.script === "depositETH") {
    const depositNFTAnswers = await inquirer.prompt([
      {
        type: "input",
        name: "userAddress",
        message: "Enter the user address:",
      },
      {
        type: "input",
        name: "amount",
        message: "Enter ETH amount:",
      },
    ]);
    const command = `node depositETH.js --userAddress ${depositNFTAnswers.userAddress} --amount ${depositNFTAnswers.amount}`;
    runScript(command);
  } else if (answers.script === "listNFTForETH") {
    const listNFTAnswers = await inquirer.prompt([
      {
        type: "input",
        name: "userAddress",
        message: "Enter your wallet address:",
      },
      { type: "input", name: "tokenId", message: "Enter NFT token ID:" },
      { type: "input", name: "price", message: "Enter price in ETH:" },
    ]);
    const command = `node listNFTForETH.js --userAddress ${listNFTAnswers.userAddress} --tokenId ${listNFTAnswers.tokenId} --price ${listNFTAnswers.price}`;
    runScript(command);
  } else if (answers.script === "getListedNFT") {
    const command = `node getListedNFT.js`;
    runScript(command);
  } else if (answers.script === "buyNFT") {
    // Thêm chức năng mua NFT
    const buyNFTAnswers = await inquirer.prompt([
      {
        type: "input",
        name: "buyerAddress",
        message: "Enter your wallet address:",
      },
      {
        type: "input",
        name: "nftId",
        message: "Enter NFT ID:",
      },
    ]);
    const command = `node buyNFT.js --buyerAddress ${buyNFTAnswers.buyerAddress} --nftId ${buyNFTAnswers.nftId}`;
    runScript(command);
  } else if (answers.script === "getToken20") {
    const getToken20Answers = await inquirer.prompt([
      {
        type: "input",
        name: "userAddress",
        message: "Enter your wallet address:",
      },
      {
        type: "input",
        name: "amount",
        message: "Enter the amount of Potato:",
      },
    ]);
    const command = `node getToken20.js --userAddress ${getToken20Answers.userAddress} --amount ${getToken20Answers.amount}`;
    runScript(command);
  } else if (answers.script === "getToken20") {
    const getToken20Answers = await inquirer.prompt([
      {
        type: "input",
        name: "userAddress",
        message: "Enter your wallet address:",
      },
      {
        type: "input",
        name: "amount",
        message: "Enter the amount of Potato:",
      },
    ]);
    const command = `node getToken20.js --userAddress ${getToken20Answers.userAddress} --amount ${getToken20Answers.amount}`;
    runScript(command);
  } else if (answers.script === "checkBalanceETH") {
    const checkBalanceETHAnswer = await inquirer.prompt([
      {
        type: "input",
        name: "address",
        message: "Enter the address to check ETH balance:",
      },
    ]);
    const command = `node checkBalanceETH.js --address ${checkBalanceETHAnswer.address}`;
    runScript(command);
  } else if (answers.script === "withdrawETH") {
    const withdrawETHAnswer = await inquirer.prompt([
      {
        type: "input",
        name: "userAddress",
        message: "Enter your wallet address:",
      },
      {
        type: "input",
        name: "amount",
        message: "Enter the amount you want to withdraw:",
      },
    ]);
    const command = `node withdrawETH.js --userAddress ${withdrawETHAnswer.userAddress} --amount ${getToken20Answers.amount}`;
    runScript(command);
  } else if (answers.script === "checkDepositedETH") {
    const getToken20Answers = await inquirer.prompt([
      {
        type: "input",
        name: "userAddress",
        message: "Enter your wallet address:",
      },
    ]);
    const command = `node checkDepositedETH.js --userAddress ${getToken20Answers.userAddress}`;
    runScript(command);
  } else if (answers.script === "checkBalance21") {
    const checkBalance21Answer = await inquirer.prompt([
      {
        type: "input",
        name: "address",
        message: "Enter the address to check Potato balance:",
      },
    ]);
    const command = `node checkBalance21.js --address ${checkBalance21Answer.address}`;
    runScript(command);
  } else if (answers.script === "checkBalance21") {
    const checkBalance21Answer = await inquirer.prompt([
      {
        type: "input",
        name: "address",
        message: "Enter the address to check Potato balance:",
      },
    ]);
    const command = `node checkBalance21.js --address ${checkBalance21Answer.address}`;
    runScript(command);
  } else if (answers.script === "depositPotato") {
    const depositPotatoAnswer = await inquirer.prompt([
      {
        type: "input",
        name: "userAddress",
        message: "Enter your wallet address:",
      },
      {
        type: "input",
        name: "amount",
        message: "Enter the amount of Potato you want to deposit:",
      },
    ]);
    const command = `node depositPotato.js --userAddress ${depositPotatoAnswer.userAddress} --amount ${depositPotatoAnswer.amount}`;
    runScript(command);
  } else if (answers.script === "listPotatoForNFT") {
    const listPotatoForNFTAnswer = await inquirer.prompt([
      {
        type: "input",
        name: "userAddress",
        message: "Enter your wallet address:",
      },
      {
        type: "input",
        name: "amount",
        message: "Enter amount of listed Potato:",
      },
      {
        type: "input",
        name: "tokenId",
        message: "Enter NFT ID:",
      },
    ]);
    const command = `node listPotatoForNFT.js --userAddress ${listPotatoForNFTAnswer.userAddress} --amount ${listPotatoForNFTAnswer.amount} --tokenId ${listPotatoForNFTAnswer.tokenId}`;
    runScript(command);
  } else if (answers.script === "getListedPotato") {
    const command = `node getListedPotato.js`;
    runScript(command);
  } else if (answers.script === "buyPotato") {
    const buyPotatoAnswer = await inquirer.prompt([
      {
        type: "input",
        name: "buyerAddress",
        message: "Enter your wallet address:",
      },
      {
        type: "input",
        name: "basketId",
        message: "Enter Potato basket ID:",
      },
    ]);
    const command = `node buyPotato.js --buyerAddress ${buyPotatoAnswer.buyerAddress} --basketId ${buyPotatoAnswer.basketId}`;
    runScript(command);
  } else if (answers.script === "depositNFT") {
    const depositNFTAnswers = await inquirer.prompt([
      {
        type: "input",
        name: "userAddress",
        message: "Enter the user address:",
      },
      { type: "input", name: "tokenId", message: "Enter the token ID:" },
    ]);
    const command = `node depositNFT.js --userAddress ${depositNFTAnswers.userAddress} --tokenId ${depositNFTAnswers.tokenId}`;
    runScript;
  }
};

mainMenu();
