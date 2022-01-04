import { ethereum, log } from "@graphprotocol/graph-ts"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { Order } from "../../generated/schema"
import { debug } from "../helpers/debug"


export namespace orders {

    export function invalidateOrder(orderId: string, event: ethereum.Event): void {

        let order = Order.load(orderId)

        if (!order) {
            order = new Order(orderId)
            let msg = "Order " + orderId + " was not found. It was created for being invalidated"
            debug.addLog(event, msg)
            log.warning('Order {} was not found. It was created for being invalidated', [orderId])
        }

        order.isValid = false
        order.save()
    }

    export function getOrCreateOrder(orderId: string, timestamp: BigInt, owner: Address): Order {

        let order = Order.load(orderId)

        if (!order) {
            order = new Order(orderId)
            order.timestamp = timestamp
            order.isValid = true
        } else {
            if (order.timestamp > timestamp) {
                order.timestamp = timestamp
            }
        }

        order.owner = owner.toHexString()
        order.save()

        return order as Order
    }
}