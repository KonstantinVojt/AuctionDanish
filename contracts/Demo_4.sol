// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Demo {
    //Struct
    struct Payment {
        uint amount;
        uint timestamp;
        address from;
        string massage;

    }

    struct Balance {
        uint totalPayments;
        mapping(uint => Payment) payments;
    }

    mapping(address => Balance) public balances;

    function getPayment(address _addr, uint _index) public view returns(Payment memory) {
        return balances[_addr].payments[_index];
    }

    function pay(string memory message) public payable {
        uint paymentNum = balances[msg.sender].totalPayments;
        balances[msg.sender].totalPayments++;

        Payment memory newPayment = Payment(
            msg.value,
            block.timestamp,
            msg.sender,
            message
        );

        balances[msg.sender].payments[paymentNum] = newPayment;
    }

    // Byte
    // bytes32 public myVar = "test here";
    // bytes public myDynVar = "test here";
    // // bytes public my_K_Var = unicode"кирилица";
    // // 1 --> 32
    // // 32 * 8 = 256
    // // uint256

    // function demo() public view returns(bytes1){
    //     // return myDynVar.length;
    //     return myDynVar[0];

    // }
    // Array
    // uint[] public items;
    // uint public len;
    // function demo() public {
    //     items.push(4);
    //     items.push(5);
    //     len = items.length;
    // }

    // function sampleMemory() public view returns(uint[] memory){
    //     uint[] memory tempArray = new uint[](10);
    //     tempArray[0] = 1;
    //     return tempArray;
    // }
    // string[5] public strings;
    // uint[3][2] public items;

    // function demo() public {
    //     items = [
    //         [3,4,5],
    //         [6,7,8]
    //     ];

    // }

    // Enum
    // enum Status { Paid, Delivered, Received}
    // Status public currentStatus;

    // function pay() public {
    //     currentStatus = Status.Paid;

    // }
    
    //     function delivered() public {
    //     currentStatus = Status.Delivered;

    // }
}
