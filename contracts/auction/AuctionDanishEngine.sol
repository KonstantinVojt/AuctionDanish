// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./IAuctionDanishEngine.sol";

contract AuctionDanishEngine is IAuctionDanishEngine, Ownable, Pausable {
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

    uint256 constant public DURATION = 2 days; // 2 * 24 * 60 * 60
    uint256 constant public FEE = 10; //10%
    uint256 public minStartingPrice;
    uint256 public maxStartingPrice;
    uint256 public accumulatedFees;

    Auction[] public auctions;

    event StartingPriceLimitsUpdated(uint256 minPrice, uint256 maxPrice);
    event AuctionCancelled(uint256 index);
    event FeesWithdrawn(uint256 amountFees, address owner);
    event Paused();
    event Unpaused();

    constructor() Ownable(msg.sender) {}

    function buy(uint256 index) external payable whenNotPaused() {
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
        uint256 feeAmount = ((cPrice * FEE) / 100);
        accumulatedFees += feeAmount;
        if(refund > 0) {
            payable(msg.sender).transfer(refund);
        }
        cAuction.seller.transfer(
            cPrice - feeAmount
        ); // 500
        // 500 - ((500 * 10) / 100) = 500 - 50 = 450
        emit AuctionEnded(index, cPrice, msg.sender);
    }

    function withdrawFees() external onlyOwner {
        uint256 amount = accumulatedFees;
        if (amount == 0) revert NoFeesToWithdraw();
        
        accumulatedFees = 0;
        (bool success,) = payable(msg.sender).call{value: amount}("");
        require(success);

        emit FeesWithdrawn(amount, msg.sender);
    }

    function createAuction(uint256 _startingPrice, uint256 _discountRate, string calldata _item, uint256 _duration) external whenNotPaused() {
        uint256 duration = _duration == 0 ? DURATION : _duration;
        if (_startingPrice < _discountRate * duration) {
            revert IncorrectStartingPrice();
        }

        if (_startingPrice < minStartingPrice || _startingPrice > maxStartingPrice) {
            revert StartingPriceOutOfRange();
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

    function cancelAuction(uint256 _index) external {
        Auction memory auction = auctions[_index];

        if (auction.seller != msg.sender) revert NotSeller();
        if (auction.stopped) revert AuctionStopped();
        if (block.timestamp >= auction.endsAt) revert AuctionAlreadyEnded();

        auctions[_index].stopped = true;
        auctions[_index].finalPrice = 0;

        emit AuctionCancelled(_index);
    }

    function setStartingPriceLimits(uint256 _min, uint256 _max) external onlyOwner {
        if (_min > _max) revert InvalidPriceLimits();

        minStartingPrice = _min;
        maxStartingPrice = _max;

        emit StartingPriceLimitsUpdated(_min, _max);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function getPriceFor(uint256 index) public view returns(uint256) {
        Auction storage cAuction = auctions[index];
        _requireNotStopped(cAuction);
        uint256 elapsed = block.timestamp - cAuction.startAt;
        uint256 discount = cAuction.discountRate * elapsed;
        return cAuction.startingPrice - discount;
    }

    function _requireNotStopped(Auction storage auction) internal view {
        if (auction.stopped) {
            revert AuctionStopped();
        }
    }

}
