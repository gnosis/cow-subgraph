import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import { User } from "../../generated/schema"

export namespace users {
    export function getOrCreateUser(orderOwner: string, timestamp: BigInt, owner: Address) :void {

        let user = User.load(orderOwner)

        if (!user) {
            user = new User(orderOwner)
            user.firstTradeTimestamp = timestamp
            user.address = owner
            user.numberOfTrades = 0
            user.solvedAmountEth = BigDecimal.zero()
            user.solvedAmountUsd = BigDecimal.zero()
            user.tradedAmountEth = BigDecimal.zero()
            user.tradedAmountUsd = BigDecimal.zero()
            user.save()
        }
    }
}