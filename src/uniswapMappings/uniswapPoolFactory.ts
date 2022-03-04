import { ALLOWED_TOKENS } from '../utils/pricing'
/* eslint-disable prefer-const */
import { ZERO_BI, ZERO_BD } from '../utils/constants'
import { PoolCreated } from '../../generated/Factory/Factory'
import { UniswapPool, Token, Bundle } from '../../generated/schema'
import { Pool as PoolTemplate } from '../../generated/templates'
import { log, Address } from '@graphprotocol/graph-ts'
import { tokens } from '../modules'

export function handlePoolCreated(event: PoolCreated): void {
  // temp fix
  if (event.params.pool == Address.fromHexString('0x8fe8d9bb8eeba3ed688069c3d6b556c9ca258248')) {
    return
  }

  let bundle = Bundle.load('1')
  if (bundle === null) {
    // create new bundle for tracking eth price
    let bundle = new Bundle('1')
    bundle.ethPriceUSD = ZERO_BD
    bundle.save()
  }

  let pool = new UniswapPool(event.params.pool.toHexString()) as UniswapPool
  let token0 = tokens.getOrCreateToken(event.params.token0, ZERO_BI)
  let token1 = tokens.getOrCreateToken(event.params.token1, ZERO_BI)

    // bail if we couldn't figure out the decimals
  if (token0.decimals == -1 || token1.decimals == -1) {
    log.debug('mybug the decimal on some token was null', [])
    return
  }

  // update white listed pools
  if (ALLOWED_TOKENS.includes(token0.id)) {
    let newPools = token1.allowedPools
    newPools.push(pool.id)
    token1.allowedPools = newPools
  }
  if (ALLOWED_TOKENS.includes(token1.id)) {
    let newPools = token0.allowedPools
    newPools.push(pool.id)
    token0.allowedPools = newPools
  }

  pool.token0 = token0.id
  pool.token1 = token1.id
  pool.liquidity = ZERO_BI
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
