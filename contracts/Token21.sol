// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token21 is ERC20, Ownable {
    uint256 public constant PRICE_PER_TOKEN = 0.0004 ether; // Price per token
    uint256 public constant TOTAL_SUPPLY = 200 * 10**18;   // Total supply of 200 tokens

    constructor() ERC20("Token21", "T21") Ownable() {
        _mint(address(this), TOTAL_SUPPLY); // Mint total supply to the contract itself
    }

    function buyToken(uint256 amount) external payable {
        uint256 totalCost = amount * PRICE_PER_TOKEN;
        require(msg.value >= totalCost, "Insufficient ETH sent");
        require(balanceOf(address(this)) >= amount, "Not enough tokens available");

        _transfer(address(this), msg.sender, amount * 10**18); // Chuyển đúng số lượng token
    }

    function withdraw() external onlyOwner {
        require(address(this).balance > 0, "No ETH to withdraw");
        payable(owner()).transfer(address(this).balance);
    }
}
