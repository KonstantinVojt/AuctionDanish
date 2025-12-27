// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "./ERC721.sol";

// contract ERC721URIStorage is ERC721 {
//     mapping(uint => string) _tokenURIs;

//     function tokenURI(uint tokenId) public view virtual override _requireMinted(tokenId) {
//         string memory _tokenURI = _tokenURIs[tokenId];
//         string memory _base = _baseURI();
//         if(bytes(_base).length == 0) {
//             return tokenURI;
//         }
//         if(bytes(_base).length > 0) {
//             return string(abi.encodePacked(_base, _tokenURI));
//         }

//         return super.tokenURI(tokenId);
//     }

//     function _setTokenURI(uint tokenId, string memory _tokenURI) internal virtual _requireMinted(tokenId) {
//         _tokenURIs[tokenId] = _tokenURI;
//     }

//     function burn(uint tokenId) public override {
//         super.burn(tokenId);
//         if(bytes(_tokenURIs[tokenId]).length != 0) {
//             delete _tokenURIs[tokenId];
//         }
//     } 
// }
