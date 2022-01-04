import { ethereum } from "@graphprotocol/graph-ts";
import { Debug } from "../../generated/schema";

export namespace debug {
    export function addLog(event: ethereum.Event, msg: string): void {
        let txHash = event.transaction.hash
        let logIdx = event.logIndex
        let debugId = txHash.toHex() + "|" + logIdx.toString()

        let debugEntity = new Debug(debugId)

        debugEntity.eventIndex = logIdx
        debugEntity.txHash = txHash
        debugEntity.timestamp = event.block.timestamp
        debugEntity.message = msg

    }
}