import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import { DailyTotal, TokenDailyTotal, TokenHourlyTotal, Total } from "../../generated/schema"
import { tokens } from "."

// Constants
let ZERO_BI = BigInt.fromI32(0)
let ONE_BI = BigInt.fromI32(1)
let TWO_BI = BigInt.fromI32(2)
let THREE_BI = BigInt.fromI32(3)
let ZERO_BD = BigDecimal.zero()

let ADDRESS_ZERO = Address.zero()

export function generateMocks(): void {

    let momentOnMarchFirst = 1646145194

    let dayId = momentOnMarchFirst / 86400
    let dayStartTimestamp = dayId * 86400
    let lastDayTimestamp = dayStartTimestamp +  (86400 * 7)

    let hourId = momentOnMarchFirst / 3600
    let hourStartTimestamp = hourId * 3600
    let lastHourTimestamp = hourStartTimestamp + (3600 * 24)

    mockTotals()

    // mocking 7 days
    for (let i = dayStartTimestamp; i < lastDayTimestamp; i = i + 86400) {
        let i_BI = BigInt.fromI32(i)
        mockDailyTotals(i_BI)
        mockTokenDailyTotals(i_BI)
    }

    // mocking 24 hs.
    for (let i = hourStartTimestamp; i < lastHourTimestamp; i = i + 3600) {
        let i_BI = BigInt.fromI32(i)
        mockHourlyTotals(i_BI)
        mockTokenHourlyTotals(i_BI)
    }

}

function mockTotals(): void {
    
    let totals = new Total("1")

    totals.tokens = ONE_BI
    totals.orders = TWO_BI
    totals.traders = THREE_BI
    totals.settlements = ZERO_BI
    totals.volumeEth = ZERO_BD
    totals.volumeUsd = ZERO_BD
    totals.feesUsd = ZERO_BD
    totals.feesEth = ZERO_BD

    totals.save()
}

function mockDailyTotals(timestamp: BigInt): void {

    let dailyTotals = new DailyTotal(timestamp.toString())

    dailyTotals.timestamp = timestamp
    dailyTotals.totalTokens = THREE_BI
    dailyTotals.orders = TWO_BI
    dailyTotals.settlements = ONE_BI
    dailyTotals.volumeEth = ZERO_BD
    dailyTotals.volumeUsd = ZERO_BD
    dailyTotals.feesEth = ZERO_BD
    dailyTotals.feesUsd = ZERO_BD
    dailyTotals.tokens = []

    dailyTotals.save()
}

function mockHourlyTotals(timestamp: BigInt): void {

    let hourlyTotals = new DailyTotal(timestamp.toString())

    hourlyTotals.timestamp = timestamp
    hourlyTotals.totalTokens = THREE_BI
    hourlyTotals.orders = TWO_BI
    hourlyTotals.settlements = ONE_BI
    hourlyTotals.volumeEth = ZERO_BD
    hourlyTotals.volumeUsd = ZERO_BD
    hourlyTotals.feesEth = ZERO_BD
    hourlyTotals.feesUsd = ZERO_BD
    hourlyTotals.tokens = []

    hourlyTotals.save()
}

function mockTokenDailyTotals(timestamp: BigInt): void {
    tokens.getOrCreateToken(ADDRESS_ZERO, ZERO_BI)
    let tokenDailyTotals = new TokenDailyTotal(ADDRESS_ZERO.toHexString())
    tokenDailyTotals.token = ADDRESS_ZERO.toHexString()
    tokenDailyTotals.timestamp = timestamp
    tokenDailyTotals.totalVolume = ZERO_BD
    tokenDailyTotals.totalVolumeEth = ZERO_BD
    tokenDailyTotals.totalVolumeUsd = ZERO_BD
    tokenDailyTotals.totalTrades = THREE_BI
    tokenDailyTotals.openPrice = ZERO_BD
    tokenDailyTotals.closePrice = ZERO_BD
    tokenDailyTotals.higherPrice = ZERO_BD
    tokenDailyTotals.lowerPrice = ZERO_BD
    tokenDailyTotals.averagePrice = ZERO_BD

    tokenDailyTotals.save()
}

function mockTokenHourlyTotals(timestamp: BigInt): void {
    tokens.getOrCreateToken(ADDRESS_ZERO, ZERO_BI)
    let tokenHourlyTotals = new TokenHourlyTotal(ADDRESS_ZERO.toHexString())
    tokenHourlyTotals.token = ADDRESS_ZERO.toHexString()
    tokenHourlyTotals.timestamp = timestamp
    tokenHourlyTotals.totalVolume = ZERO_BD
    tokenHourlyTotals.totalVolumeEth = ZERO_BD
    tokenHourlyTotals.totalVolumeUsd = ZERO_BD
    tokenHourlyTotals.totalTrades = THREE_BI
    tokenHourlyTotals.openPrice = ZERO_BD
    tokenHourlyTotals.closePrice = ZERO_BD
    tokenHourlyTotals.higherPrice = ZERO_BD
    tokenHourlyTotals.lowerPrice = ZERO_BD
    tokenHourlyTotals.averagePrice = ZERO_BD

    tokenHourlyTotals.save()
}