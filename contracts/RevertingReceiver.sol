// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AuctionDanishEngine.sol";

contract RevertingReceiver {

    function withdraw(address auction) external {
        AuctionDanishEngine(auction).withdrawFees();
    }

    receive() external payable {
        revert("I refuse ETH");
    }
}
