import { Address, BigInt } from "@graphprotocol/graph-ts"
import { ERC20 } from "../../generated/GPV2Settlement/ERC20"
import { Token } from "../../generated/schema"
import { getPrice } from "../helpers/getPrice"

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
          token.priceUSD = getPrice(tokenAddress).get("usd")
          token.priceETH = getPrice(tokenAddress).get("eth")
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