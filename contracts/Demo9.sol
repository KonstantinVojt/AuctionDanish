// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
// 15 gwei
// 0.00003532 USD
contract Op {
    // uint demo = 1;
    // uint128 a = 1;
    // uint128 b = 1;
    // uint256 c = 1;
    // bytes32 public hash = ;

    // mapping(address => uint ) payments;
    // uint [10] payments;
    // function pay() external payable {
    //     require(msg.sender != address(0), "zero address");
    //     payments[0] = msg.value;
    // }

    // uint [] demo = [1,2,3];

    // uint c = 5;
    // uint d;
    // function calc() public {
    //     uint a = 1 + c;
    //     uint b = 2 * c;
    //     d = a + b;

    // }

    uint public result = 1;
    function doWork(uint[] memory data) public {
        uint temp = 1;
        for(uint i = 0; i < data.length; i++) {
            temp *= data[i];
        }
        result = temp;
    }

}

contract Un {
    // uint8 demo = 1;
    // uint128 a = 1;
    // uint256 c = 1;
    // uint128 b = 1;

    // bytes32 public hash = keccak256(
    //     abi.encodePacked("test")
    // );

        // mapping(address => uint ) payments;
    //     uint[] payments;
    // function pay() external payable {
    //     address _from = msg.sender;
    //     require(_from != address(0), "zero address");
    //     payments.push(msg.value);
    // }

    // uint[] demo = [1,2,3];

    // uint c = 5;
    // uint d;
    // function calc() public {
    //     uint a = 1 + c;
    //     uint b = 2 * c;
    //     call2(a, b);
    // }

    // function call2(uint a, uint b) private {
    //     d = a + b;
    // }

    uint public result = 1;
    function doWork(uint[] memory data) public {
        for(uint i = 0; i < data.length; i++) {
            result *= data[i];
        }
    }

}