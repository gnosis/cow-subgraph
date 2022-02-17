import {
    Address,
    BigDecimal,
    BigInt,
    dataSource
} from "@graphprotocol/graph-ts"
import { UniswapV2Pair } from '../../generated/GPV2Settlement/UniswapV2Pair'
import { UniswapV2Factory } from '../../generated/GPV2Settlement/UniswapV2Factory'
import {
    ONE_BD,
    ZERO_ADDRESS,
    ZERO_BI,
    UNISWAP_FACTORY,
    STABLECOIN_ADDRESS,
    WETH_ADDRESS,
    EMPTY_RESERVES_RESULT
} from "./constants"
import { tokens } from "../modules"
import { DebugEntity } from "../../generated/schema"


function getPair(token0: Address, token1: Address): Address {
    let factory = UniswapV2Factory.bind(UNISWAP_FACTORY)
    let factoryPairTry = factory.try_getPair(token0, token1)
    return factoryPairTry.reverted ? ZERO_ADDRESS as Address : factoryPairTry.value
}

function placeDebugEntity(token0: Address, token1: Address, reserves0: BigInt, reserves1: BigInt, dec0: BigDecimal, dec1: BigDecimal): void {
    let id = token0.toHexString() + '-' + token1.toHexString()
    let debug = new DebugEntity(id)
    debug.token0 = token0.toHexString()
    debug.token1 = token1.toHexString()
    debug.reserves0 = reserves0
    debug.reserves1 = reserves1
    debug.dec0 = dec0
    debug.dec1 = dec1
    debug.save()
}

function valueWithTokenDecimals(val: BigInt, token: Address): BigDecimal {
    let val_bd = val.toBigDecimal()
    let tokenDecimals = tokens.getTokenDecimals(token) as u8
    let pow = BigInt.fromI32(10).pow(tokenDecimals).toBigDecimal()
    return val_bd.div(pow)
}

function calculatePrice(token0: Address, token1: Address, pairToken: Address, reserves0: BigInt, reserves1: BigInt): BigDecimal {
    let reserves0WithDecimals = valueWithTokenDecimals(reserves0, token0)
    let reserves1WithDecimals = valueWithTokenDecimals(reserves1, token1)
    placeDebugEntity(token0, token1, reserves0, reserves1, reserves0WithDecimals, reserves1WithDecimals)
    return token0 == pairToken
        ? reserves1WithDecimals.div(reserves0WithDecimals)
        : reserves0WithDecimals.div(reserves1WithDecimals)
}

function getUniswapPricesForPair(token0: Address, token1: Address, isEthPriceCalculation: bool): BigDecimal {
    let pair = UniswapV2Pair.bind(getPair(token0, token1))
    let reservesTry = pair.try_getReserves()
    let reserves = reservesTry.reverted ? EMPTY_RESERVES_RESULT : reservesTry.value
    let pairToken0Try = pair.try_token0()
    let pairToken0 = pairToken0Try.reverted ? ZERO_ADDRESS : pairToken0Try.value
    let pairToken1Try = pair.try_token1()
    let pairToken1 = pairToken1Try.reverted ? ZERO_ADDRESS : pairToken1Try.value

    if (reserves.value0 == ZERO_BI ||
        reserves.value1 == ZERO_BI ||
        pairToken0 == ZERO_ADDRESS ||
        pairToken1 == ZERO_ADDRESS) {
        return ONE_BD
    }

    // this call inverts prices depending on token1 is weth or not (find a better way)
    if (isEthPriceCalculation) {
        return calculatePrice(pairToken1, pairToken0, token0, reserves.value1, reserves.value0)
    }
    return calculatePrice(pairToken0, pairToken1, token0, reserves.value0, reserves.value1)
}

export function getPrice(token: Address): BigDecimal {
    let network = dataSource.network()

    let stablecoin = STABLECOIN_ADDRESS.get(network)
    let weth = WETH_ADDRESS.get(network)

    if (token.toHex() == stablecoin.toHex()) {
        return ONE_BD
    }

    if (token == weth) {
        return getUniswapPricesForPair(token, stablecoin, false)
    }

    let priceETH = getUniswapPricesForPair(token, weth, true)
    // notice calculate price is inverted when token2 is weth
    return priceETH.times(getPrice(weth))
}