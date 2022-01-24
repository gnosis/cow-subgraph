/* eslint-disable prefer-const */
import { Bundle, Pool, Token } from '../generated/schema'
import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import {
  Burn as BurnEvent,
  Initialize,
  Mint as MintEvent,
  Swap as SwapEvent
} from '../generated/templates/Pool/Pool'
import { convertTokenToDecimal } from './helpers'
import { findEthPerToken, getEthPriceInUSD, sqrtPriceX96ToTokenPrices } from './helpers/pricing'

export function handleInitialize(event: Initialize): void {
  let pool = Pool.load(event.address.toHexString())

  // update token prices
  if (pool) {
    let token0 = Token.load(pool.token0)
    let token1 = Token.load(pool.token1)

    // update ETH price now that prices could have changed
    let bundle = Bundle.load('1')

    if (bundle) {
      bundle.ethPriceUSD = getEthPriceInUSD()
      bundle.save()
    }

    // update token prices
    if (token0) {
      token0.derivedETH = findEthPerToken(token0 as Token)
      token0.save()
    }

    if (token1) {
      token1.derivedETH = findEthPerToken(token1 as Token)
      token1.save()
    }
  }
}

export function handleMint(event: MintEvent): void {
  let bundle = Bundle.load('1')
  let poolAddress = event.address.toHexString()
  let pool = Pool.load(poolAddress)

  if(pool && bundle) {
    let token0 = Token.load(pool.token0)
    let token1 = Token.load(pool.token1)
    let amount0 = BigDecimal.zero()
    let amount1 = BigDecimal.zero()
    if (token0 && token1) {
      amount0 = convertTokenToDecimal(event.params.amount0, BigInt.fromI32(token0.decimals))
      amount1 = convertTokenToDecimal(event.params.amount1, BigInt.fromI32(token1.decimals))
    }
    pool.liquidity = pool.liquidity.plus(event.params.amount)
    pool.totalValueLockedToken0 = pool.totalValueLockedToken0.plus(amount0)
    pool.totalValueLockedToken1 = pool.totalValueLockedToken1.plus(amount1)
    pool.save()
  }
}

export function handleBurn(event: BurnEvent): void {
  let bundle = Bundle.load('1')
  let poolAddress = event.address.toHexString()
  let pool = Pool.load(poolAddress)

  if(pool && bundle) {
    let token0 = Token.load(pool.token0)
    let token1 = Token.load(pool.token1)
    let amount0 = BigDecimal.zero()
    let amount1 = BigDecimal.zero()
    if (token0 && token1) {
      amount0 = convertTokenToDecimal(event.params.amount0, BigInt.fromI32(token0.decimals))
      amount1 = convertTokenToDecimal(event.params.amount1, BigInt.fromI32(token1.decimals))
    }
    pool.liquidity = pool.liquidity.minus(event.params.amount)
    pool.totalValueLockedToken0 = pool.totalValueLockedToken0.minus(amount0)
    pool.totalValueLockedToken1 = pool.totalValueLockedToken1.minus(amount1)
    pool.save()
  }
}

export function handleSwap(event: SwapEvent): void {
  let bundle = Bundle.load('1')
  let pool = Pool.load(event.address.toHexString())

  if (pool) {
  // hot fix for bad pricing
    if (pool.id == '0x9663f2ca0454accad3e094448ea6f77443880454') {
      return
    }

    let token0 = Token.load(pool.token0)
    let token1 = Token.load(pool.token1)
    let amount0 = BigDecimal.zero()
    let amount1 = BigDecimal.zero()

    if (token0 && token1 && bundle) {
      amount0 = convertTokenToDecimal(event.params.amount0, BigInt.fromI32(token0.decimals))
      amount1 = convertTokenToDecimal(event.params.amount1, BigInt.fromI32(token1.decimals))

      pool.liquidity = event.params.liquidity
      pool.totalValueLockedToken0 = pool.totalValueLockedToken0.plus(amount0)
      pool.totalValueLockedToken1 = pool.totalValueLockedToken1.plus(amount1)

      // updated pool ratess
      let prices = sqrtPriceX96ToTokenPrices(event.params.sqrtPriceX96, token0 as Token, token1 as Token)
      pool.token0Price = prices[0]
      pool.token1Price = prices[1]
      pool.save()

      bundle.ethPriceUSD = getEthPriceInUSD()
      bundle.save()

      token0.derivedETH = findEthPerToken(token0 as Token)
      token1.derivedETH = findEthPerToken(token1 as Token)

      pool.save()
      token0.save()
      token1.save()
    }
  }
}