import { Address, BigDecimal, BigInt, dataSource, log } from "@graphprotocol/graph-ts"
import { UniswapV2Pair, UniswapV2Pair__getReservesResult } from '../../generated/GPV2Settlement/UniswapV2Pair'
import { UniswapV2Factory } from '../../generated/GPV2Settlement/UniswapV2Factory'
import { ONE_BD, ZERO_ADDRESS, ZERO_BI } from "./constants"
import { tokens } from "../modules"
import { DebugEntity } from "../../generated/schema"

let UNISWAP_FACTORY = Address.fromString('0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f')

let wethAddress = new Map<string, Address>()
wethAddress.set('rinkeby', Address.fromString('0xc778417E063141139Fce010982780140Aa0cD5Ab'))
wethAddress.set('mainnet', Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'))

let stablecoinAddress = new Map<string, Address>()
stablecoinAddress.set('rinkeby', Address.fromString('0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea'))
stablecoinAddress.set('mainnet', Address.fromString('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')) // USDC

let defaultEmpty = new UniswapV2Pair__getReservesResult(ZERO_BI, ZERO_BI, ZERO_BI)

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

        pair.token0()

        return calculatePrice(pairToken0, pairToken1, token, reserves.value0, reserves.value1)
    }

    let pair = UniswapV2Pair.bind(getPair(token, weth))
    let reservesTry = pair.try_getReserves()
    let reserves = reservesTry.reverted ? defaultEmpty : reservesTry.value
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

    return calculatePrice(pairToken1, pairToken0, token, reserves.value1, reserves.value0).times(getPrice(weth))
}