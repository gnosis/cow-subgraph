import { WHITELIST_TOKENS } from './helpers/pricing'
/* eslint-disable prefer-const */
import {  ZERO_BD } from './helpers/constants'
import { PoolCreated } from '../generated/Factory/Factory'
import { Pool, Bundle } from '../generated/schema'
import { tokens } from './modules'
import { Pool as PoolTemplate } from '../generated/templates'
import { BigInt, Address } from '@graphprotocol/graph-ts'

export function handlePoolCreated(event: PoolCreated): void {
  // temp fix 
  if (event.params.pool == Address.fromHexString('0x8fe8d9bb8eeba3ed688069c3d6b556c9ca258248')) {
    return
  }

  let bundle = Bundle.load('1')
  if (!bundle) {
    // create new bundle for tracking eth price
    let bundle = new Bundle('1')
    bundle.ethPriceUSD = ZERO_BD
    bundle.save()
  }

  let pool = new Pool(event.params.pool.toHexString()) as Pool

  let token0 = tokens.getOrCreateToken(event.params.token0, BigInt.fromI32(0))
  let token1 = tokens.getOrCreateToken(event.params.token1, BigInt.fromI32(0))

  // update allowed pools
  if (WHITELIST_TOKENS.includes(token0.id)) {
    let newPools = token1.allowedPools
    newPools.push(pool.id)
    token1.allowedPools = newPools
  }
  if (WHITELIST_TOKENS.includes(token1.id)) {
    let newPools = token0.allowedPools
    newPools.push(pool.id)
    token0.allowedPools = newPools
  }

  pool.token0 = token0.id
  pool.token1 = token1.id
  pool.createdAtTimestamp = event.block.timestamp
  pool.createdAtBlockNumber = event.block.number
  pool.token0Price = ZERO_BD
  pool.token1Price = ZERO_BD
  pool.totalValueLockedToken0 = ZERO_BD
  pool.totalValueLockedToken1 = ZERO_BD
  pool.save()
  // create the tracked contract based on the template
  PoolTemplate.create(event.params.pool)
  token0.save()
  token1.save()
}
