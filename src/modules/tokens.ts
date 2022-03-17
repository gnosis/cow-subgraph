import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import { ERC20 } from "../../generated/GPV2Settlement/ERC20"
import { Token, Total } from "../../generated/schema"
import { generateMocks } from "./mocksGenerator"

const DEFAULT_DECIMALS = 18

export namespace tokens {

  export function getOrCreateToken(tokenAddress: Address, timestamp: BigInt): Token {

    // Next lines were added for call mock generator. This code would never reach real subgraphs.
    let totals = Total.load("1")
    if (!totals) {
      generateMocks()
    }

    let tokenId = tokenAddress.toHexString()
    let token = Token.load(tokenId)

    if (!token) {
      token = new Token(tokenId)
      token.address = tokenAddress
      token.firstTradeTimestamp = timestamp

      let erc20Token = ERC20.bind(tokenAddress)
      let tokenDecimals = erc20Token.try_decimals()
      let tokenName = erc20Token.try_name()
      let tokenSymbol = erc20Token.try_symbol()
      token.decimals = !tokenDecimals.reverted
        ? tokenDecimals.value
        : DEFAULT_DECIMALS
      token.name = !tokenName.reverted ? tokenName.value : ""
      token.symbol = !tokenSymbol.reverted ? tokenSymbol.value : ""
      token.priceUSD = BigDecimal.zero()
      token.priceETH = BigDecimal.zero()
      token.history = []
      token.numberOfTrades = 0
      token.totalVolumeEth = BigDecimal.zero()
      token.totalVolumeUsd = BigDecimal.zero()
    }

    token.save()

    return token as Token
  }
}