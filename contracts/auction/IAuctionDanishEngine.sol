// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAuctionDanishEngine {

    struct Auction {
        address payable seller;
        uint256 startingPrice;
        uint256 finalPrice;
        uint256 startAt;
        uint256 endsAt;
        uint256 discountRate;
        string item;
        bool stopped;
    }

    event AuctionCreated(uint index, string item, uint256 startingPrice, uint256 duration);
    event AuctionEnded(uint index, uint256 finalPrice, address winner);

}
