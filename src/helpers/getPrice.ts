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

function getPair(token0: Address, token1: Address): Address {
    let factory = UniswapV2Factory.bind(UNISWAP_FACTORY)
    let factoryPairTry = factory.try_getPair(token0, token1)
    return factoryPairTry.reverted ? ZERO_ADDRESS as Address : factoryPairTry.value
}

let defaultEmpty = new UniswapV2Pair__getReservesResult(ZERO_BI, ZERO_BI, ZERO_BI)

export function getPairPrice(pairAddress: Address): BigDecimal {
    let pair = UniswapV2Pair.bind(pairAddress)
    let reserves = pair.getReserves()
    let totalSupply = pair.totalSupply();

    if (totalSupply.gt(ZERO_BI)) {
        let valueOfToken0 = getPrice(pair.token0()).times(reserves.value0.divDecimal(EIGHTEEN_DECIMALS))
        let valueOfToken1 = getPrice(pair.token1()).times(reserves.value1.divDecimal(EIGHTEEN_DECIMALS))
        let lpTokenPrice = (valueOfToken0.plus(valueOfToken1)).div((pair.totalSupply().divDecimal(EIGHTEEN_DECIMALS)))
        return lpTokenPrice;
    }

    return ZERO_BD;
}

export function getPrice(token: Address): BigDecimal {
    let network = dataSource.network()

    let stablecoin = stablecoinAddress.get(network)
    let weth = wethAddress.get(network)

    if (token.toHex() == stablecoin.toHex()) {
        return ONE_BD
    }

    if (token == weth) {
        let pair = UniswapV2Pair.bind(getPair(token, stablecoin))
        let reservesTry = pair.try_getReserves()
        let reserves = reservesTry.reverted ? defaultEmpty : reservesTry.value

        if (reserves.value0 == ZERO_BI || reserves.value1 == ZERO_BI) {
            return ONE_BD
        }

        let ethPrice = token == pair.token0()
            ? reserves.value1.toBigDecimal().div(reserves.value0.toBigDecimal())
            : reserves.value0.toBigDecimal().div(reserves.value1.toBigDecimal())
        return ethPrice
    }

    let pair = UniswapV2Pair.bind(getPair(token, weth))
    let reservesTry = pair.try_getReserves()
    let reserves = reservesTry.reverted ? defaultEmpty : reservesTry.value

    if (reserves.value0 == ZERO_BI || reserves.value1 == ZERO_BI) {
        return ONE_BD
    }

    let priceInETH = token == pair.token0()
        ? reserves.value1.toBigDecimal().div(reserves.value0.toBigDecimal())
        : reserves.value0.toBigDecimal().div(reserves.value1.toBigDecimal())

    return priceInETH.times(getPrice(weth))
}