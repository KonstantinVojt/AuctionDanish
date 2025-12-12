// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Demo6 {
    // public
    // external
    // internal
    // private

    string message = "hallo!"; // state
    uint public balance;

    fallback() external payable {
        
    }

    receive() external payable {

    }

    function pay() external payable {
        balance += msg.value;
    }

    // transaction
    function setMessage(string memory newMessage) external {
        message = newMessage;
    }

    // view
    // pure

    // call

    function getBalance() public view returns(uint balance) {
        balance = address(this).balance;
        return balance;
    }

    function getMessage() external view returns(string memory) {
        return message;
    }

    function rate(uint amount) public pure returns(uint) {
        return amount * 3;
    }

}