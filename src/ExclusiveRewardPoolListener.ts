import { saveReward } from "./types/Reward";
import { saveApyReward } from "./types/Apy";
import {
  ExclusiveRewardPoolContract, InitExclusiveCall,
  RewardAdded
} from "../generated/ExclusiveRewardPoolListener/ExclusiveRewardPoolContract";
import { Address } from "@graphprotocol/graph-ts";
import { AutoStake } from "../generated/schema";
import { loadOrCreateVault } from "./types/Vault";
import { AutoStakeListner } from "../generated/templates";
import { loadOrCreateExclusiveRewardPool } from "./types/ExclusiveRewardPool";

export function handleRewardAdded(event: RewardAdded): void {
  const poolAddress = event.address
  const pool = loadOrCreateExclusiveRewardPool(poolAddress, event.block)
  const vault = loadOrCreateVault(Address.fromString(pool.vault), event.block)
  vault.pool = pool.id
  vault.save()

  const poolContract = ExclusiveRewardPoolContract.bind(poolAddress)
  const rewardAmount = event.params.reward
  const rewardToken = poolContract.rewardToken()
  const rewardRate = poolContract.rewardRate()
  const periodFinish = poolContract.periodFinish()

  saveReward(poolAddress, rewardToken, rewardRate, periodFinish, rewardAmount, event.transaction, event.block)
  saveApyReward(poolAddress, rewardToken, rewardRate, periodFinish, rewardAmount, event.transaction, event.block)
}

export function handleInitExclusive(call: InitExclusiveCall): void {
  const autoStakeAddress = call.inputs._exclusive
  let autoStack = AutoStake.load(autoStakeAddress.toHex())
  if (autoStack == null) {
    autoStack = new AutoStake(autoStakeAddress.toHex())
    autoStack.timestamp = call.block.timestamp
    autoStack.createAtBlock = call.block.number
    autoStack.save()
    AutoStakeListner.create(autoStakeAddress)
    loadOrCreateVault(autoStakeAddress, call.block)
  }
}