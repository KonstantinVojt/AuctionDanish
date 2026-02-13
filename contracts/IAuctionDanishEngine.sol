// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

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

    error IncorrectStartingPrice();
    error AuctionStopped();
    error AuctionAlreadyEnded();
    error NotEnoughFunds();
    error InvalidPriceLimits();
    error StartingPriceOutOfRange();
    error NotSeller();
    error NoFeesToWithdraw();
    error ContractPaused();
    error ContractUnpaused();

    event AuctionCreated(uint256 index, string item, uint256 startingPrice, uint256 duration);
    event AuctionEnded(uint256 index, uint256 finalPrice, address winner);
    event StartingPriceLimitsUpdated(uint256 minPrice, uint256 maxPrice);
    event AuctionCancelled(uint256 index);
    event FeesWithdrawn(uint256 amountFees, address owner);
    event Paused();
    event Unpaused();

}
