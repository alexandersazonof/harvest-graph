import { Address, BigInt } from "@graphprotocol/graph-ts";
import { PotPoolContract } from "../../generated/MegaFactory/PotPoolContract";
import { NULL_ADDRESS } from "./Constant";

export function fetchRewardTokenLength(address: Address): BigInt {
  const pool = PotPoolContract.bind(address)
  const tryRewardTokenLength = pool.try_rewardTokensLength()
  return tryRewardTokenLength.reverted ? BigInt.fromI32(1) : tryRewardTokenLength.value
}

export function fetchRewardToken(address: Address, index: BigInt): Address {
  const pool = PotPoolContract.bind(address);
  const tryRewardToken = pool.try_rewardTokens(index)
  return tryRewardToken.reverted ? NULL_ADDRESS : tryRewardToken.value
}

export function fetchRewardRateForToken(address: Address, token: Address): BigInt {
  const pool = PotPoolContract.bind(address);
  const tryRewardRateForToken = pool.try_rewardRateForToken(token)
  return tryRewardRateForToken.reverted ? BigInt.zero() : tryRewardRateForToken.value
}