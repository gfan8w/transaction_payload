// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CompressCallData {

    //包装M函数，外部传入参数使用uint240格式，调用M函数时，展开参数
    function wrapM(uint240 input) external pure returns(bytes memory) {
        // 最高位的1字节的6个bits表示参数是否是默认值，如果为0，表示是默认值，1表示不是默认值，
        // 最高位的1字节中的最低位的1指示param1是否是默认值，依次类推，第4位0x08是表示地址是否是默认值的，但地址默认值会直接传0x0，所以跳空不判断
        uint8 flag = uint8((input>>230)&0xff);

        uint256 param6= (flag & 0x20) == 0x20 ? input & 0x3fff : 0;
        uint256 param5= (flag & 0x10) == 0x10 ? (input>>14) & 0x3fff : 0;
        uint256 param3= (flag & 0x4) == 0x4 ? (input>>(14*2)) & 0x3fff : 0;
        uint256 param2= (flag & 0x2) == 0x2 ? (input>>(14*3)) & 0x3fff : 0;
        uint256 param1= (flag & 0x1) == 0x1 ? (input>>(14*4)) & 0x3fff : 0;
        address addr = address(uint160(input>>(14*5)));

        // Param3 和 Param6是介于 1 和 2 之间的数，后续这里要给他们添加上整数部分，这里略去不处理。
        // 整数扩展为 1e18 时，注意最后4位是小数
        M(param1,param2,param3,addr,param5,param6);

        //返回一个内容做单测
        return abi.encodePacked(param1,param2,param3,addr,param5,param6);
    }


    function M (uint256 param1, uint256 param2,uint256 param3, address addr, uint256 param5,uint256 param6) public pure {

    }

}
