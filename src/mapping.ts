import {
  Interaction,
  OrderInvalidated,
  PreSignature,
  Settlement,
  Trade
} from "../generated/GPV2Settlement/GPV2Settlement"
import { tokens, trades, orders, users } from "./modules"

export function handleInteraction(event: Interaction): void {}

export function handleOrderInvalidated(event: OrderInvalidated): void {
  let orderId = event.params.orderUid.toHexString()
  orders.invalidateOrder(orderId, event)
}

export function handlePreSignature(event: PreSignature): void {}

export function handleSettlement(event: Settlement): void {}


export function handleTrade(event: Trade): void {
  let orderId = event.params.orderUid.toHexString()
  let owner = event.params.owner
  let sellTokenAddress = event.params.sellToken
  let buyTokenAddress = event.params.buyToken

  let timestamp = event.block.timestamp

  let sellToken = tokens.getOrCreateToken(sellTokenAddress, timestamp)
  let buyToken = tokens.getOrCreateToken(buyTokenAddress, timestamp)

  trades.getOrCreateTrade(event, buyToken, sellToken)
 
  let order = orders.getOrCreateOrder(orderId, timestamp, owner)

  users.getOrCreateUser(order.owner, timestamp, owner)
}
