// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Contract for Token71
contract Token71 is ERC721URIStorage, Ownable {
    uint256 public constant PRICE = 0.1 ether;
    uint256 private _currentTokenId;

    constructor() ERC721("Token71", "T71") Ownable() {
        //_currentTokenId = 0;
    }

    function mintToken(string memory tokenURI) external payable {

        _currentTokenId += 1;
        _safeMint(msg.sender, _currentTokenId);
        _setTokenURI(_currentTokenId, tokenURI);
    }

    function getCurrentTokenId() external view returns (uint256) {
        return _currentTokenId;
    }
}


