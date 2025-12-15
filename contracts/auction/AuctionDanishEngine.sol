// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IAuctionDanishEngine";

contract AuctionDanishEngine is IAuctionDanishEngine, Ownable {

    uint256 constant public DURATION = 2 days; // 2 * 24 * 60 * 60
    uint256 constant public FEE = 10; //10%

    Auction[] public auctions;


    constructor() Ownable(msg.sender) {}

    error IncorrectStartingPrice();
    error AuctionStopped();
    error AuctionAlreadyEnded();
    error NotEnoughFunds();

    function _requireNotStopped(Auction storage auction) internal view {
        if (auction.stopped) {
            revert AuctionStopped();
        }
    }

    function createAuction(uint256 _startingPrice, uint256 _discountRate, string calldata _item, uint256 _duration) external {
        uint256 duration = _duration == 0 ? DURATION : _duration;
        if (_startingPrice < _discountRate * duration) {
            revert IncorrectStartingPrice();
        }
        Auction memory newAuction = Auction({
            seller: payable(msg.sender),
            startingPrice: _startingPrice,
            finalPrice: _startingPrice,
            discountRate: _discountRate,
            startAt: block.timestamp,
            endsAt: block.timestamp + duration,
            item: _item,
            stopped: false
        });
        
        auctions.push(newAuction);

        emit AuctionCreated(auctions.length - 1, _item, _startingPrice, duration);
    }

    function getPriceFor(uint256 index) public view returns(uint256) {
        Auction storage cAuction = auctions[index];
        _requireNotStopped(cAuction);
        uint256 elapsed = block.timestamp - cAuction.startAt;
        uint256 discount = cAuction.discountRate * elapsed;
        return cAuction.startingPrice - discount;
    }

    // function stop(uint index) {
    //     Auction storage cAuction = auctions[index];
    //     cAuction.stopped = true;
    // }

    function buy(uint256 index) external payable {
        Auction storage cAuction = auctions[index];
        _requireNotStopped(cAuction);
        if (block.timestamp >= cAuction.endsAt) {
            revert AuctionAlreadyEnded();
        }

        uint256 cPrice = getPriceFor(index);
        if (msg.value < cPrice) {
            revert NotEnoughFunds();
        }

        cAuction.stopped = true;
        cAuction.finalPrice = cPrice;
        uint256 refund = msg.value - cPrice;
        if(refund > 0) {
            payable(msg.sender).transfer(refund);
        }
        cAuction.seller.transfer(
            cPrice - ((cPrice * FEE) / 100)
        ); // 500
        // 500 - ((500 * 10) / 100) = 500 - 50 = 450
        emit AuctionEnded(index, cPrice, msg.sender);
    }
}
