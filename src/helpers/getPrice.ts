import { Address, BigInt, BigDecimal, dataSource } from "@graphprotocol/graph-ts"
import { UniswapV2Pair, UniswapV2Pair__getReservesResult } from '../../generated/GPV2Settlement/UniswapV2Pair'
import { UniswapV2Factory } from '../../generated/GPV2Settlement/UniswapV2Factory'
import { ONE_BD, ZERO_ADDRESS, ZERO_BD, ZERO_BI } from "./constants"

let UNISWAP_FACTORY = Address.fromString('0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f')
let EIGHTEEN_DECIMALS = BigInt.fromI32(10).pow(18).toBigDecimal()

let wethAddress = new Map<string, Address>()
wethAddress.set('rinkeby', Address.fromString('0xc778417E063141139Fce010982780140Aa0cD5Ab'))
wethAddress.set('mainnet', Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'))

let stablecoinAddress = new Map<string, Address>()
stablecoinAddress.set('rinkeby', Address.fromString('0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea'))
stablecoinAddress.set('mainnet', Address.fromString('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')) // USDC


// 0x0000000000085d4780b73119b644ae5ecd22b376 , 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
function getPair(token0: Address, token1: Address): Address {
    let factory = UniswapV2Factory.bind(UNISWAP_FACTORY) //0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f
    let factoryPairTry = factory.try_getPair(token0, token1) // {reverted: false, value:  0xf1f27Db872b7F6E8B873C97F785fe4f9a6C92161}
    return factoryPairTry.reverted ? ZERO_ADDRESS as Address : factoryPairTry.value // 0xf1f27Db872b7F6E8B873C97F785fe4f9a6C92161
}

let defaultEmpty = new UniswapV2Pair__getReservesResult(ZERO_BI, ZERO_BI, ZERO_BI)

@unmanaged class ReturnPriceValue {
    priceInUsd: BigDecimal
    priceInEth: BigDecimal
    ethPrice: BigDecimal

    constructor(priceInUsd: BigDecimal, priceInEth: BigDecimal, ethPrice: BigDecimal) {
        this.priceInUsd = priceInUsd;
        this.priceInEth = priceInEth;
        this.ethPrice = ethPrice;
    }
}

//export function getPairPrice(pairAddress: Address): BigDecimal {
    //let pair = UniswapV2Pair.bind(pairAddress)
    //let reserves = pair.getReserves()
    //let totalSupply = pair.totalSupply();

    //if (totalSupply.gt(ZERO_BI)) {
        //let valueOfToken0 = getPrice(pair.token0()).times(reserves.value0.divDecimal(EIGHTEEN_DECIMALS))
        //let valueOfToken1 = getPrice(pair.token1()).times(reserves.value1.divDecimal(EIGHTEEN_DECIMALS))
        //let lpTokenPrice = (valueOfToken0.plus(valueOfToken1)).div((pair.totalSupply().divDecimal(EIGHTEEN_DECIMALS)))
        //return lpTokenPrice;
    //}

    //return ZERO_BD;
//}

// TUSD 0x0000000000085d4780b73119b644ae5ecd22b376
export function getPrice(token: Address): ReturnPriceValue {
    let network = dataSource.network() // mainnet

    let stablecoin = stablecoinAddress.get(network) //0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
    let weth = wethAddress.get(network) //0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2

    if (token.toHex() == stablecoin.toHex()) {  // False
        return new ReturnPriceValue(ONE_BD, ONE_BD, ONE_BD)
    }

    if (token == weth) { // False // enter with wethPrice
        // getPair Params 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
        let pair = UniswapV2Pair.bind(getPair(token, stablecoin)) // 0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc
        let reservesTry = pair.try_getReserves() /* {reverted: false, value:  _reserve0 uint112, _reserve1 uint112, _blockTimestampLast uint32
  _reserve0|uint112 :  113374291525926
  _reserve1|uint112 :  38613935012116821565752
  _blockTimestampLast|uint32 :  1644847051}*/
        let reserves = reservesTry.reverted ? defaultEmpty : reservesTry.value /*  _reserve0 uint112, _reserve1 uint112, _blockTimestampLast uint32
  _reserve0|uint112 :  113374291525926
  _reserve1|uint112 :  38613935012116821565752
  _blockTimestampLast|uint32 :  1644847051*/

        if (reserves.value0 == ZERO_BI || reserves.value1 == ZERO_BI) { // false
            return new ReturnPriceValue(ONE_BD, ONE_BD, ONE_BD)
        }

        // 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2. 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
        let ethPrice = token == pair.token0()
            ? reserves.value1.toBigDecimal().div(reserves.value0.toBigDecimal()) // false
            : reserves.value0.toBigDecimal().div(reserves.value1.toBigDecimal()) // 0.0000000002936097848881493851003
        return new ReturnPriceValue(ethPrice, ONE_BD, ethPrice)
    }

    // get Pair -> 0xf1f27Db872b7F6E8B873C97F785fe4f9a6C92161
    let pair = UniswapV2Pair.bind(getPair(token, weth))
    let reservesTry = pair.try_getReserves() /* {reverted: false, value:  _reserve0 uint112, _reserve1 uint112, _blockTimestampLast uint32
    _reserve0|uint112 :  2594115815191623639177
    _reserve1|uint112 :  2571830917
    _blockTimestampLast|uint32 :  1642622136 } */
    let reserves = reservesTry.reverted ? defaultEmpty : reservesTry.value /* _reserve0 uint112, _reserve1 uint112, _blockTimestampLast uint32
  _reserve0|uint112 :  2594115815191623639177
  _reserve1|uint112 :  2571830917
  _blockTimestampLast|uint32 :  1642622136 */

    if (reserves.value0 == ZERO_BI || reserves.value1 == ZERO_BI) { // false
        return new ReturnPriceValue(ZERO_BD, ZERO_BD, ZERO_BD)
    }

    // token: 0x0000000000085d4780b73119b644ae5ecd22b376, pair.token0: 0x0000000000085d4780b73119b644ae5ecd22b376
    let priceInETH = token == pair.token0()
        // 2571830917 / 2594115815191623639177
        ? reserves.value1.toBigDecimal().div(reserves.value0.toBigDecimal()) // 0.00000000000009914094436103742401728
        : reserves.value0.toBigDecimal().div(reserves.value1.toBigDecimal()) // False


    let wethPrice = getPrice(weth).ethPrice // 2.936097848881493851003E-9
    let priceInUSD = priceInETH.times(wethPrice) // 9.914094436103742401728E-13 * 2.936097848881493851003E-9 = 2.910875134745218485415E-21
    return new ReturnPriceValue(priceInUSD, priceInETH, wethPrice)
}