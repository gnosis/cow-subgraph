import { Address, BigInt } from "@graphprotocol/graph-ts"
import { ERC20 } from "../../generated/GPV2Settlement/ERC20"
import { Token } from "../../generated/schema"
import { MINUS_ONE_BD, ZERO_BI } from "../helpers/constants"
import { getPrices } from "../helpers/getPrices"

const DEFAULT_DECIMALS = 18

export namespace tokens {

  export function getOrCreateToken(tokenAddress: Address, timestamp: BigInt): Token {
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
      token.totalVolume = ZERO_BI
      let tokenPrices = getPrices(tokenAddress)
      if (tokenPrices.get("usd") != MINUS_ONE_BD &&
        tokenPrices.get("eth") != MINUS_ONE_BD) {
        token.priceUsd = tokenPrices.get("usd")
        token.priceEth = tokenPrices.get("eth")
      }
      token.save()
    }

    return token as Token
  }

  export function getTokenDecimals(tokenAddress: Address): number {
    let tokenId = tokenAddress.toHexString()
    let token = Token.load(tokenId)

    if (token) {
      return token.decimals
    }

    let erc20Token = ERC20.bind(tokenAddress)
    let tokenDecimals = erc20Token.try_decimals()

    return tokenDecimals.reverted ? DEFAULT_DECIMALS : tokenDecimals.value
  }
}