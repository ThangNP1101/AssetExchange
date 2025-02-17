// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/* IAssetExchange interface
   Interface for the AssetExchange contract */
interface IAssetExchange {
    function depositETH() external payable;
    function depositPotato(address tokenAddress, uint256 amount) external;
    function depositNFT(address tokenAddress, uint256 tokenId) external;
    function listNFTForETH(
        address tokenAddress,
        uint256 tokenId,
        uint256 price
    ) external;
    function listPotatoForNFT(
        address tokenAddress,
        uint256 amount,
        address nftAddress,
        uint256 tokenId
    ) external;
    function buyNFT(uint256 id) external payable;
    function buyPotatoByNFT(uint256 id) external payable;
    function withdrawETH(uint256 amount) external;
    function withdrawERC20(address tokenAddress, uint256 amount) external;
    function withdrawERC721(address tokenAddress, uint256 tokenId) external;
}
