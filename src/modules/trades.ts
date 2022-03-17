import { BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import { Trade } from "../../generated/GPV2Settlement/GPV2Settlement"

import { Token, TokenTradingEvent, Trade as TradeEntity } from "../../generated/schema"
import { settlements } from "./"

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
        let txGasPrice = event.transaction.gasPrice
        let txGasLimit = event.transaction.gasLimit
        let feeAmount = event.params.feeAmount

        // check if event.address is the solver
        settlements.getOrCreateSettlement(txHash, timestamp, feeAmount, event.address)


        let trade = TradeEntity.load(tradeId)

        if (!trade) {
            trade = new TradeEntity(tradeId)
            trade.buyAmountEth = BigDecimal.zero()
            trade.buyAmountUsd = BigDecimal.zero()
            trade.sellAmountEth = BigDecimal.zero()
            trade.sellAmountUsd = BigDecimal.zero()
        }

        getOrCreateTokenTradingEvent(buyToken.id, tradeId, timestamp)
        getOrCreateTokenTradingEvent(sellToken.id, tradeId, timestamp)

        trade.timestamp = timestamp
        trade.txHash = txHash
        trade.settlement = txHashString
        trade.buyToken = buyToken.id
        trade.buyAmount = buyAmount
        trade.sellToken = sellToken.id
        trade.sellAmount = sellAmount
        trade.order = orderId
        trade.gasPrice = txGasPrice
        trade.gasLimit = txGasLimit
        trade.feeAmount = feeAmount
        trade.save()
    }

    function getOrCreateTokenTradingEvent(token: string, trade: string, timestamp: BigInt): void {
        let timestampString = timestamp.toString()
        let id = token + "-" + trade + "-" + timestampString
        let tokenTradingEvent = new TokenTradingEvent(id) 
        tokenTradingEvent.token = token
        tokenTradingEvent.trade = trade
        tokenTradingEvent.timestamp = timestamp
        tokenTradingEvent.amountEth = BigDecimal.zero()
        tokenTradingEvent.amountUsd = BigDecimal.zero()

        tokenTradingEvent.save()
    }

}