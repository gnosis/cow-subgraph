import { Address, BigInt } from "@graphprotocol/graph-ts"
import { ERC20 } from "../../generated/GPV2Settlement/ERC20"
import { Token } from "../../generated/schema"
import { ZERO_BD } from "../utils/constants"
import { ERC20SymbolBytes } from '../../generated/Factory/ERC20SymbolBytes'
import { ERC20NameBytes } from '../../generated/Factory/ERC20NameBytes'
import { StaticTokenDefinition } from '../utils/staticTokenDefinition'
import { isNullEthValue } from '../utils'

const DEFAULT_DECIMALS = 18

export namespace tokens {

  export function getOrCreateToken(tokenAddress: Address, timestamp: BigInt): Token {
    let tokenId = tokenAddress.toHexString()
    let token = Token.load(tokenId)

    if (!token) {
      token = new Token(tokenId)
      token.address = tokenAddress
      token.firstTradeTimestamp = timestamp

      token.decimals = fetchTokenDecimals(tokenAddress) as i32
      token.name = fetchTokenName(tokenAddress)
      token.symbol = fetchTokenSymbol(tokenAddress)
      token.derivedETH = ZERO_BD
      token.allowedPools = []

    }
    // adding timestamp for token created by uniswap logic
    if (!token.firstTradeTimestamp) {
      token.firstTradeTimestamp = timestamp
    }

    token.save()

    return token as Token
  }

  function fetchTokenSymbol(tokenAddress: Address): string {
    let contract = ERC20.bind(tokenAddress)
    let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress)

    // try types string and bytes32 for symbol
    let symbolValue = 'unknown'
    let symbolResult = contract.try_symbol()
    if (symbolResult.reverted) {
      let symbolResultBytes = contractSymbolBytes.try_symbol()
      if (!symbolResultBytes.reverted) {
        // for broken pairs that have no symbol function exposed
        if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
          symbolValue = symbolResultBytes.value.toString()
        } else {
          // try with the static definition
          let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress)
          if (staticTokenDefinition != null) {
            symbolValue = staticTokenDefinition.symbol
          }
        }
      }
    } else {
      symbolValue = symbolResult.value
    }

    return symbolValue
  }

  function fetchTokenName(tokenAddress: Address): string {
    let contract = ERC20.bind(tokenAddress)
    let contractNameBytes = ERC20NameBytes.bind(tokenAddress)

    // try types string and bytes32 for name
    let nameValue = 'unknown'
    let nameResult = contract.try_name()
    if (nameResult.reverted) {
      let nameResultBytes = contractNameBytes.try_name()
      if (!nameResultBytes.reverted) {
        // for broken exchanges that have no name function exposed
        if (!isNullEthValue(nameResultBytes.value.toHexString())) {
          nameValue = nameResultBytes.value.toString()
        } else {
          // try with the static definition
          let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress)
          if (staticTokenDefinition != null) {
            nameValue = staticTokenDefinition.name
          }
        }
      }
    } else {
      nameValue = nameResult.value
    }

    return nameValue
  }

  function fetchTokenDecimals(tokenAddress: Address): BigInt {
    let contract = ERC20.bind(tokenAddress)
    // try types uint8 for decimals
    let decimalValue = DEFAULT_DECIMALS
    let decimalResult = contract.try_decimals()
    if (!decimalResult.reverted) {
      decimalValue = decimalResult.value
    } else {
      // try with the static definition
      let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress)
      if (staticTokenDefinition != null) {
        return staticTokenDefinition.decimals
      }
    }

    return BigInt.fromI32(decimalValue as i32)
  }

}