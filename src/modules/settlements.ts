import { BigInt, Bytes, Address, BigDecimal } from "@graphprotocol/graph-ts"
import { Settlement, User } from "../../generated/schema"

export namespace settlements {

    export function getOrCreateSettlement(txHash: Bytes, tradeTimestamp: BigInt, feeAmount: BigInt, solverAddress: Address): void { 

        let solver = new User(solverAddress.toHexString()) 
        solver.isSolver = true
        solver.save() 

        let settlementId = txHash.toHexString()

        let settlement = Settlement.load(settlementId)

        if (!settlement) {
            settlement = new Settlement(settlementId)
            settlement.txHash = txHash
            settlement.solver = solver.id
            settlement.txCostEth = BigDecimal.zero()
            settlement.txCostUsd = BigDecimal.zero()
            settlement.save()
        } 
    }
}