// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

contract AssertExchange is Ownable {
    // Lưu trữ số dư của người dùng
    mapping(address => uint256) public balanceETH;
    mapping(address => mapping(address => uint256)) public balance20; // userAddress => (token => balance) user's  approved for contract
    mapping(address => mapping(uint256 => address)) public balance721; // tokenAddress => (tokenId => ownership)
    mapping(address => mapping(address => uint256)) public userNFTCount; // Lưu số lượng NFT của mỗi user theo từng token

    // Basket structures
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
    uint256 private ethToPotatoCounter;

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

    function depositETH() external payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        balanceETH[msg.sender] += msg.value;
    }

    function depositPotato(address tokenAddress, uint256 amount) external {
        require(amount > 0, "Deposit amount must be greater than zero");
        IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            amount * 10 ** 18
        );
        balance20[tokenAddress][msg.sender] += amount * 10 ** 18;
    }

    function depositNFT(address tokenAddress, uint256 tokenId) external {
        IERC721(tokenAddress).transferFrom(msg.sender, address(this), tokenId);
        balance721[tokenAddress][tokenId] = msg.sender; // Lưu quyền sở hữu
        userNFTCount[msg.sender][tokenAddress]++; // Tăng số lượng NFT của user cho tokenAddress
    }

    function listNFTForETH(
        address tokenAddress,
        uint256 tokenId,
        uint256 price
    ) external {
        require(price > 0, "Price must be greater than zero");

        // Kiểm tra nếu NFT đã được deposit trước đó
        if (IERC721(tokenAddress).ownerOf(tokenId) == address(this)) {
            // Nếu NFT đã được deposit, đảm bảo người gọi là chủ sở hữu ban đầu
            require(
                balance721[tokenAddress][tokenId] == msg.sender,
                "You are not the depositor"
            );
        } else {
            // Nếu NFT chưa deposit, chuyển vào smart contract
            IERC721(tokenAddress).transferFrom(
                msg.sender,
                address(this),
                tokenId
            );
        }

        // Lấy tokenURI
        string memory tokenURI = IERC721Metadata(tokenAddress).tokenURI(
            tokenId
        );

        // Thêm vào danh sách niêm yết
        basketNFTForETH[nftCounter] = BasketNFTForETH({
            tokenAddress: tokenAddress,
            tokenId: tokenId,
            tokenURI: tokenURI,
            price: price,
            seller: msg.sender
        });

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
            revert("Something went wrong in line 149");
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

    // function listETHForPotato(
    //     uint256 amountETH,
    //     address potatoAddress,
    //     uint256 potatoAmount
    // ) external payable {
    //     require(potatoAmount > 0, "Token amount must be greater than zero");

    //     basketETHForPotato[ethToPotatoCounter] = BasketETHForPotato({
    //         amountETH: amountETH,
    //         seller: msg.sender,
    //         tokenAddress: potatoAddress,
    //         tokenAmount: potatoAmount
    //     });

    //     emit ETHForPotatoListed(
    //         ethToPotatoCounter,
    //         msg.sender,
    //         amountETH,
    //         potatoAddress,
    //         potatoAmount
    //     );
    //     ethToPotatoCounter++;
    // }

    function buyNFT(uint256 id) external payable {
        BasketNFTForETH memory item = basketNFTForETH[id];
        require(item.tokenAddress != address(0), "NFT not found");
        require(
            balanceETH[msg.sender] >= item.price,
            "Insufficient ETH balance"
        );

        balanceETH[msg.sender] -= item.price;
        balanceETH[item.seller] += item.price;
        IERC721(item.tokenAddress).transferFrom(
            address(this),
            msg.sender,
            item.tokenId
        );

        // Cập nhật số lượng NFT của người mua và người bán
        userNFTCount[item.seller][item.tokenAddress]--;
        userNFTCount[msg.sender][item.tokenAddress]++;
        balance721[item.tokenAddress][item.tokenId] = msg.sender;

        delete basketNFTForETH[id];

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

        userNFTCount[item.seller][item.nftAddress]++;
        userNFTCount[msg.sender][item.nftAddress]--;
        balance721[item.nftAddress][item.tokenId] = item.seller;

        delete basketPotatoForNFT[id];

        emit PotatoForNFTPurchased(id, msg.sender);
    }

    // function buyETHByPotato(uint256 id) external payable {
    //     BasketETHForPotato memory item = basketETHForPotato[id];
    //     require(item.tokenAddress != address(0), "Item not found");
    //     IERC20(item.tokenAddress).transferFrom(
    //         msg.sender,
    //         item.seller,
    //         item.tokenAmount
    //     );
    //     payable(msg.sender).transfer(msg.value);
    //     delete basketETHForPotato[id];
    //     emit ETHForTokenPurchased(id, msg.sender);
    // }

    function withdrawETH(uint256 amount) external {
        require(balanceETH[msg.sender] >= amount, "Insufficient ETH balance");
        balanceETH[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    function withdrawERC20(address tokenAddress, uint256 amount) external {
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
        require(
            balance721[tokenAddress][tokenId] == msg.sender,
            "You are not the owner of this NFT"
        );

        // Xóa thông tin ownership trong mapping trước khi trả NFT lại
        balance721[tokenAddress][tokenId] = address(0);

        IERC721(tokenAddress).transferFrom(address(this), msg.sender, tokenId);
    }
}
