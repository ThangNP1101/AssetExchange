// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

contract AssertExchange is Ownable {
    uint256 public constant MAX_PRICE = 1_000_000 ether;
    uint256 public constant MAX_AMOUNT = type(uint256).max / (10 ** 18);
    // store user balances
    mapping(address => uint256) public balanceETH; //user's ETH deposited balance
    mapping(address => mapping(address => uint256)) public balance20; // userAddress => (token => balance) user's  approved for contract
    mapping(address => mapping(uint256 => address)) public balance721; // tokenAddress => (tokenId => ownership)
    mapping(address => mapping(address => uint256)) public userNFTCount; // Number of NFTs owned by user for each token

    // Basket structures (store listed items)
    struct BasketNFTForETH {
        address tokenAddress;
        uint256 tokenId;
        string tokenURI;
        uint256 price; //
        address seller;
    }

    struct BasketPotatoForNFT {
        address seller;
        address tokenAddress;
        uint256 amount;
        address nftAddress;
        uint256 tokenId;
    }

    struct BasketETHForPotato {
        uint256 amountETH;
        address seller;
        address tokenAddress;
        uint256 tokenAmount;
    }

    mapping(uint256 => BasketNFTForETH) public basketNFTForETH;
    mapping(uint256 => BasketPotatoForNFT) public basketPotatoForNFT;
    mapping(uint256 => BasketETHForPotato) public basketETHForPotato;

    uint256 private nftCounter;
    uint256 private potatoCounter;

    event NFTForEthListed(
        uint256 id,
        address seller,
        address tokenAddress,
        uint256 tokenId,
        uint256 price
    );
    event PotatoForNFTListed(
        uint256 id,
        address seller,
        address tokenAddress,
        uint256 amount,
        address nftAddress,
        uint256 tokenId
    );
    event ETHForPotatoListed(
        uint256 id,
        address seller,
        uint256 amount,
        address tokenAddress,
        uint256 price
    );
    event NFTPurchased(uint256 id, address buyer);
    event PotatoForNFTPurchased(uint256 id, address buyer);
    event ETHForTokenPurchased(uint256 id, address buyer);
    event ETHDeposited(address depositor, uint256 amount);
    event PotatoDeposited(
        address depositor,
        address tokenAddress,
        uint256 amount
    );
    event NFTDeposited(
        address depositor,
        address tokenAddress,
        uint256 tokenId
    );

    function depositETH() external payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        balanceETH[msg.sender] += msg.value;
        emit ETHDeposited(msg.sender, msg.value);
    }

    function depositPotato(address tokenAddress, uint256 amount) external {
        require(amount > 0, "Deposit amount must be greater than zero");
        require(amount <= MAX_AMOUNT, "Deposit amount exceeds maximum limit");
        require(tokenAddress != address(0), "Invalid token address");

        bool success = IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            amount * 10 ** 18
        );
        require(success, "Token transfer failed");

        balance20[tokenAddress][msg.sender] += amount * 10 ** 18;
        emit PotatoDeposited(msg.sender, tokenAddress, amount);
    }

    function depositNFT(address tokenAddress, uint256 tokenId) external {
        require(tokenAddress != address(0), "Invalid token address");
        IERC721(tokenAddress).transferFrom(msg.sender, address(this), tokenId);
        balance721[tokenAddress][tokenId] = msg.sender; // store ownership of deposited NFT
        userNFTCount[msg.sender][tokenAddress]++; // increase number of NFTs owned by user
        emit NFTDeposited(msg.sender, tokenAddress, tokenId);
    }

    function listNFTForETH(
        address tokenAddress,
        uint256 tokenId,
        uint256 price
    ) external {
        require(price > 0, "Price must be greater than zero");

        // Check if the price exceeds the maximum allowable price
        require(price <= MAX_PRICE, "Price exceeds maximum limit");

        require(tokenAddress != address(0), "Invalid token address");

        // Check the ownership of the NFT
        if (IERC721(tokenAddress).ownerOf(tokenId) == address(this)) {
            require(
                balance721[tokenAddress][tokenId] == msg.sender,
                "You are not the depositor"
            );
        } else {
            IERC721(tokenAddress).transferFrom(
                msg.sender,
                address(this),
                tokenId
            );
        }

        // Get tokenURI
        string memory tokenURI = IERC721Metadata(tokenAddress).tokenURI(
            tokenId
        );

        // Update the basket
        basketNFTForETH[nftCounter] = BasketNFTForETH({
            tokenAddress: tokenAddress,
            tokenId: tokenId,
            tokenURI: tokenURI,
            price: price,
            seller: msg.sender
        });

        nftCounter++;

        emit NFTForEthListed(
            nftCounter,
            msg.sender,
            tokenAddress,
            tokenId,
            price
        );
    }

    function listPotatoForNFT(
        address tokenAddress,
        uint256 amount,
        address nftAddress,
        uint256 tokenId
    ) external {
        require(amount > 0, "Amount must be greater than zero");
        require(amount <= MAX_AMOUNT, "Amount exceeds maximum limit");
        require(tokenAddress != address(0), "Invalid token address");
        require(
            balance20[tokenAddress][msg.sender] >= amount,
            "Insufficient balance"
        );

        if (
            IERC20(tokenAddress).balanceOf(address(this)) >= amount ||
            balance20[tokenAddress][msg.sender] >= amount
        ) {
            basketPotatoForNFT[potatoCounter] = BasketPotatoForNFT({
                seller: msg.sender,
                tokenAddress: tokenAddress,
                amount: amount,
                nftAddress: nftAddress,
                tokenId: tokenId
            });
        } else {
            revert("Listing failed");
        }

        balance20[tokenAddress][msg.sender] -= amount;

        emit PotatoForNFTListed(
            potatoCounter,
            msg.sender,
            tokenAddress,
            amount,
            nftAddress,
            tokenId
        );
        potatoCounter++;
    }

    function buyNFT(uint256 id) external payable {
        BasketNFTForETH memory item = basketNFTForETH[id];
        require(item.tokenAddress != address(0), "NFT not found");
        require(
            balanceETH[msg.sender] >= item.price,
            "Insufficient ETH balance"
        );

        // Update ownership and counter
        userNFTCount[item.seller][item.tokenAddress]--;
        userNFTCount[msg.sender][item.tokenAddress]++;
        balance721[item.tokenAddress][item.tokenId] = msg.sender;

        delete basketNFTForETH[id];

        balanceETH[msg.sender] -= item.price;
        balanceETH[item.seller] += item.price;
        IERC721(item.tokenAddress).transferFrom(
            address(this),
            msg.sender,
            item.tokenId
        );

        emit NFTPurchased(id, msg.sender);
    }

    function buyPotatoByNFT(uint256 id) external payable {
        BasketPotatoForNFT memory item = basketPotatoForNFT[id];

        require(
            balance721[item.nftAddress][item.tokenId] == msg.sender,
            "Buyer does not own the required NFT"
        );

        require(
            IERC721(item.nftAddress).ownerOf(item.tokenId) == address(this),
            "Contract does not own the NFT"
        );

        userNFTCount[item.seller][item.nftAddress]++;
        userNFTCount[msg.sender][item.nftAddress]--;
        balance721[item.nftAddress][item.tokenId] = item.seller;
        delete basketPotatoForNFT[id];

        IERC721(item.nftAddress).transferFrom(
            msg.sender,
            item.seller,
            item.tokenId
        );

        require(
            IERC20(item.tokenAddress).balanceOf(address(this)) >= item.amount,
            "Contract does not have enough tokens"
        );

        IERC20(item.tokenAddress).transfer(msg.sender, item.amount);

        emit PotatoForNFTPurchased(id, msg.sender);
    }

    function withdrawETH(uint256 amount) external {
        require(balanceETH[msg.sender] >= amount, "Insufficient ETH balance");
        balanceETH[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    function withdrawERC20(address tokenAddress, uint256 amount) external {
        require(tokenAddress != address(0), "Invalid token address");
        require(
            balance20[tokenAddress][msg.sender] >= amount,
            "Insufficient token balance"
        );
        balance20[tokenAddress][msg.sender] -= amount;
        require(
            IERC20(tokenAddress).transfer(msg.sender, amount),
            "Token transfer failed"
        );
    }

    function withdrawERC721(address tokenAddress, uint256 tokenId) external {
        require(tokenAddress != address(0), "Invalid token address");
        require(
            balance721[tokenAddress][tokenId] == msg.sender,
            "You are not the owner of this NFT"
        );

        // Delede the ownership berfore transfering the NFT
        balance721[tokenAddress][tokenId] = address(0);

        IERC721(tokenAddress).transferFrom(address(this), msg.sender, tokenId);
    }
}
