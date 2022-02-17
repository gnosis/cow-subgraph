/* eslint-disable prefer-const */
import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { UniswapV2Pair__getReservesResult } from '../../generated/GPV2Settlement/UniswapV2Pair'

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_ADDRESS = Address.zero()
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')

export let EMPTY_RESERVES_RESULT = new UniswapV2Pair__getReservesResult(ZERO_BI, ZERO_BI, ZERO_BI)

export let UNISWAP_FACTORY = Address.fromString('0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f')

export let WETH_ADDRESS = new Map<string, Address>()
WETH_ADDRESS.set('rinkeby', Address.fromString('0xc778417E063141139Fce010982780140Aa0cD5Ab'))
WETH_ADDRESS.set('mainnet', Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'))

export let STABLECOIN_ADDRESS = new Map<string, Address>()
STABLECOIN_ADDRESS.set('rinkeby', Address.fromString('0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea'))
STABLECOIN_ADDRESS.set('mainnet', Address.fromString('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')) // USDC