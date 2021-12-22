import { Trade } from "../../generated/GPV2Settlement/GPV2Settlement"

import { Token, Trade as TradeEntity } from "../../generated/schema"

export namespace trades {

    export function getOrCreateTrade(event: Trade, buyToken: Token, sellToken: Token): void {
        let orderId = event.params.orderUid.toHexString()
        let eventIndex = event.transaction.index.toString()
        let txHash = event.transaction.hash
        let txHashString = txHash.toHexString()
        let tradeId = orderId + "|" + txHashString + "|" + eventIndex
        let timestamp = event.block.timestamp
        let sellAmount = event.params.sellAmount
        let buyAmount = event.params.buyAmount

        let trade = TradeEntity.load(tradeId)

        if (!trade) {
            trade = new TradeEntity(tradeId)
        }

        trade.timestamp = timestamp
        trade.txHash = txHash
        trade.buyToken = buyToken.id
        trade.buyAmount = buyAmount
        trade.sellToken = sellToken.id
        trade.sellAmount = sellAmount
        trade.order = orderId
        trade.save()
    }

}