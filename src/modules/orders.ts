import { log } from "@graphprotocol/graph-ts"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { Order } from "../../generated/schema"


export namespace orders {

    export function invalidateOrder(orderId: string): void {

        let order = Order.load(orderId)

        if (!order) {
            order = new Order(orderId)
            log.critical('Order {} was not found. It was created for being invalidated', [orderId])
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