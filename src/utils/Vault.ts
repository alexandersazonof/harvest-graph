import { Address, BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { VaultContract } from "../../generated/templates/VaultListener/VaultContract";
import { BD_TEN, DEFAULT_DECIMAL, NULL_ADDRESS } from "./Constant";
import { UserBalance, UserBalanceHistory, UserTransaction, Vault } from "../../generated/schema";
import { fetchContractDecimal, fetchContractName, fetchContractSymbol } from "./ERC20";
import { loadOrCreateERC20Token } from "./Token";
import { UniswapV3VaultListener, VaultListener } from "../../generated/templates";
import { pow, powBI } from "./Math";
import { isUniswapV3 } from "./Price";
import { ERC20 } from "../../generated/Controller/ERC20";


export function fetchUnderlyingAddress(address: Address): Address {
  const vault = VaultContract.bind(address)
  const tryUnderlying = vault.try_underlying();
  if (tryUnderlying.reverted) {
    return NULL_ADDRESS
  }

  return tryUnderlying.value
}

export function fetchPricePerFullShare(address: Address): BigInt {
  const vault = VaultContract.bind(address)
  const tryGetPricePerFullShare = vault.try_getPricePerFullShare()
  const decimal = vault.try_decimals().reverted ? DEFAULT_DECIMAL : vault.decimals()
  if (tryGetPricePerFullShare.reverted) {
    return powBI(BigInt.fromI32(10), decimal)
  }
  const sharePrice: BigInt = tryGetPricePerFullShare.value
  // in some cases ppfs == 0
  if (sharePrice.le(BigInt.zero())) {
    return powBI(BigInt.fromI32(10), decimal)
  }
  return sharePrice
}

export function loadOrCreateVault(vaultAddress: Address, block: ethereum.Block, strategy: string = 'unknown'): Vault {
  let vault = Vault.load(vaultAddress.toHex())
  if (vault == null) {
    vault = new Vault(vaultAddress.toHex());
    vault.name = fetchContractName(vaultAddress)
    vault.decimal = fetchContractDecimal(vaultAddress)
    vault.symbol = fetchContractSymbol(vaultAddress)
    const underlying = fetchUnderlyingAddress(vaultAddress)
    vault.createAtBlock = block.number;
    vault.strategy = strategy
    vault.timestamp = block.timestamp;
    vault.underlying = loadOrCreateERC20Token(underlying).id
    vault.lastShareTimestamp = BigInt.zero()
    vault.lastSharePrice = BigInt.zero()
    vault.apyAutoCompound = BigDecimal.zero()
    vault.apyAutoCompoundCount = BigInt.zero()
    vault.apyReward = BigDecimal.zero()
    vault.apyRewardCount = BigInt.zero()
    vault.skipFirstApyReward = true
    if (isUniswapV3(vault.name)) {
      vault.isUniswapV3 = true
      UniswapV3VaultListener.create(vaultAddress)
    } else {
      vault.isUniswapV3 = false
      VaultListener.create(vaultAddress)
    }
    vault.save();
  }

  return vault;
}