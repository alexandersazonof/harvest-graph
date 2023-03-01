import { Address, BigInt } from "@graphprotocol/graph-ts";
import { VaultContract } from "../../generated/templates/VaultListener/VaultContract";
import { DEFAULT_DECIMAL, NULL_ADDRESS } from "./Constant";
import { powBI } from "./MathUtils";

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