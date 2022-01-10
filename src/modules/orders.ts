import { log } from "@graphprotocol/graph-ts"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { Order } from "../../generated/schema"


export namespace orders {

    export function invalidateOrder(orderId: string, timestamp: BigInt): Order {

        let order = getOrCreateOrder(orderId)

        order.isValid = false
        order.invalidateTimestamp = timestamp

        return order as Order
    }

    export function preSig(orderId: string, user: string, isPresigned: boolean, timestamp: BigInt): Order {

        let order = getOrCreateOrder(orderId)

        order.presignTimestamp = timestamp
        order.isPresigned = isPresigned

        order.presignUser = user

        return order as Order
    }

    export function getOrCreateOrderForTrade(orderId: string, timestamp: BigInt, owner: string): Order {

        let order = getOrCreateOrder(orderId)
        order.tradesTimestamp = timestamp

        order.tradesOwner = owner

        return order as Order
    }

    function getOrCreateOrder(orderId: string): Order {

        let order = Order.load(orderId)

        if (!order) {
            order = new Order(orderId)
            order.isValid = true
            order.isPresigned = false
        } 

        return order as Order
    }
}