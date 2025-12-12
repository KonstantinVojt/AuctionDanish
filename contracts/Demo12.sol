// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// import {Logger} from "./Logger.sol";
import "./ILogger.sol";

contract Demo12 {
    ILogger public logger;

    constructor(address _logger) {
        logger = ILogger(_logger);
    }

    function payments(address _from, uint _number) public view returns(uint) {
        return logger.getEntry(_from, _number);
    }

    receive() external payable {
        logger.log(msg.sender, msg.value);
    }

}
