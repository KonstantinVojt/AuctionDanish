// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Demo_2 {

    uint8 public myVal = 254;
    function inc() public {
        unchecked {
            myVal++;
        }
        
    }

    // uint public maximum;

    // function demo() public {
    //     maximum = type(uint8).max;
    // }

    // unsingned integers
    // uint public myUint = 42;


    // function demo(uint _inputUint) public {
    //     uint localUint = 42;
    //     localUint + 1;
    //     localUint - 1
    //     localUint * 2
    //     localUint / 2
    //     localUint ** 3
    //     localUint % 3
    //     -myInt;

    //     localUint == 1;
    //     localUint != 1
    //     localUint > 2
    //     localUint >= 2
    //     localUint < 3
    //     localUint <= 3
    // }

    // signed integers
    // int public myInt = -42;

    // bool public myBool = true;

    // function myFun(bool _inputBool) public {
    //     bool localBool = false;
    //     localBool && _inputBool
    //     localBool || _inputBool
    //     locslBool == _inputBool
    //     locslBool != _inputBool
    //     !locslBool
    //     if(_inputBool || localBool)

    // }
}