const {
    constants,
    BN
} = require('openzeppelin-test-helpers');

const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.should();

const CompressCallDataFactory = artifacts.require('CompressCallData');



contract('CompressCallData', accounts => {
    const ZERO =new BN('0')

    //把一个数字，只截取小数部分，并变为4位整数,输入参数小数位只能小于4位小数
    const decimalToInteger = (value) =>{
        if(0<= value && value<1){
            return value * 1000000 /100
        }else if(1<= value && value<2){
            return value * 1000000 /100 -10000
        }
        throw new Error("not support:",value)
    }

    //
    const compose_input = async (param1, param2, param3, address, param5, param6) =>{

        //param1是 0~1之间的一个数，检查是否是零，如果不是0，则去掉整数部分，留下小数，把小数变为一个4位数的整数
        const param1_bn = param1===0?ZERO:new BN((decimalToInteger(param1)).toString())
        // param2同理
        const param2_bn = param2===0?ZERO:new BN(decimalToInteger(param2).toString())
        // param3是 1~2之间的一个数，检查是否是零，如果不是0，则去掉整数部分，留下小数，把小数变为一个4位数的整数
        const param3_bn = param3===0?ZERO:new BN(decimalToInteger(param3).toString())
        // param5同param1处理
        const param5_bn = param5===0?ZERO:new BN(decimalToInteger(param5).toString())
        // param6同param3处理
        const param6_bn = param6===0?ZERO:new BN(decimalToInteger(param6).toString())

        //param4 ，address 不处理，是0x0,就传入0.

        let flag=0
        !param1_bn.eq(new BN('0'))?flag|=0x1:0
        !param2_bn.eq(new BN('0'))?flag|=0x2:0
        !param3_bn.eq(new BN('0'))?flag|=0x4:0
        !param5_bn.eq(new BN('0'))?flag|=0x10:0
        !param6_bn.eq(new BN('0'))?flag|=0x20:0
        //flag 变为bigNumber
        const flag_bn =new BN(flag.toString())

        //把地址转换为一个大整数
        let address_bn =new BN(address.substring(2),16)
        //把 param1~param6整齐排列，address就是param4。
        // 这里排列的时候，是 flag_address_param1_param2_param3_param5_param6 顺序
        // 按照题目要求，param1~param6 都已经是确定了数值范围，故省去整数，只用小数部分，小数部分4位，最大是9999，占用14个bits位
        // 向左移位，把下一个参数填入
        const input_param =flag_bn.shln(160)
            .or(address_bn)
            .shln(14)
            .or(param1_bn)
            .shln(14)
            .or(param2_bn)
            .shln(14)
            .or(param3_bn)
            .shln(14)
            .or(param5_bn)
            .shln(14)
            .or(param6_bn)

        let encodePacked = await CompressCallDataInst.wrapM(input_param)
        console.log("encodePacked result:",encodePacked)


        let CompressCallDataContract = new web3.eth.Contract(CompressCallDataFactory.abi,CompressCallDataInst.address)
        let abi = CompressCallDataContract.methods.wrapM(input_param).encodeABI()
        console.log("encodeABI:",abi)

        return encodePacked
    }


    beforeEach(async () => {
        CompressCallDataInst = await CompressCallDataFactory.new();
    });

    describe('#CompressCallData()', () => {
        it('all data are not default value(zero):', async () => {
            const param1= 0.58,param2= 0.687,param3= 1.2154,param5= 0.55,param6= 1.9999;
            const address ='0x9ea356d25c658A648f408ABE2322F2f01F12A0F0'
            let result = await compose_input(param1,param2,param3,address,param5,param6)


            const param1_hex32 = web3.utils.padLeft(decimalToInteger(param1).toString(16),64)
            const param2_hex32 = web3.utils.padLeft(decimalToInteger(param2).toString(16),64)
            const param3_hex32 = web3.utils.padLeft(decimalToInteger(param3).toString(16),64)
            const param5_hex32 = web3.utils.padLeft(decimalToInteger(param5).toString(16),64)
            const param6_hex32 = web3.utils.padLeft(decimalToInteger(param6).toString(16),64)
            expect(result).to.be.equal('0x'+param1_hex32+param2_hex32+param3_hex32+address.substring(2).toLowerCase()+param5_hex32+param6_hex32)
        });

        it('all data is default value(zero):', async () => {
            const param1= 0,param2= 0,param3= 0,param5= 0,param6= 0;
            const address =constants.ZERO_ADDRESS
            let result = await compose_input(param1,param2,param3,address,param5,param6)
            expect(result).to.be.equal('0x'+web3.utils.padLeft(param1.toString(16),64*5+40))
        });

        it('all data are not default value(zero), but param1 is zero:', async () => {
            const param1= 0,param2= 0.9999,param3= 1.9999,param5= 0.9999,param6= 1.9999;
            const address ='0x9ea356d25c658A648f408ABE2322F2f01F12A0F0'
            let result = await compose_input(param1,param2,param3,address,param5,param6)

            const param1_hex32 = web3.utils.padLeft(decimalToInteger(param1).toString(16),64)
            const param2_hex32 = web3.utils.padLeft(decimalToInteger(param2).toString(16),64)
            const param3_hex32 = web3.utils.padLeft(decimalToInteger(param3).toString(16),64)
            const param5_hex32 = web3.utils.padLeft(decimalToInteger(param5).toString(16),64)
            const param6_hex32 = web3.utils.padLeft(decimalToInteger(param6).toString(16),64)
            expect(result).to.be.equal('0x'+param1_hex32+param2_hex32+param3_hex32+address.substring(2).toLowerCase()+param5_hex32+param6_hex32)
        });
        it('all data are not default value(zero), but param6 and address is zero:', async () => {
            const param1= 0.8765,param2= 0.9329,param3= 1.1143,param5= 0.321,param6= 0;
            const address =constants.ZERO_ADDRESS
            let result = await compose_input(param1,param2,param3,address,param5,param6)

            const param1_hex32 = web3.utils.padLeft(decimalToInteger(param1).toString(16),64)
            const param2_hex32 = web3.utils.padLeft(decimalToInteger(param2).toString(16),64)
            const param3_hex32 = web3.utils.padLeft(decimalToInteger(param3).toString(16),64)
            const param5_hex32 = web3.utils.padLeft(decimalToInteger(param5).toString(16),64)
            const param6_hex32 = web3.utils.padLeft(param6.toString(16),64)
            expect(result).to.be.equal('0x'+param1_hex32+param2_hex32+param3_hex32+address.substring(2)+param5_hex32+param6_hex32)
        });
    });



});
