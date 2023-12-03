import { RewardAdded } from "../generated/PotNotifyHelperListener/PotPoolContract";
import { PotPoolContract } from "../generated/templates/PotPoolListener/PotPoolContract";
import { saveReward } from "./types/Reward";
import { saveApyReward } from "./types/Apy";
import { handlerLogic } from './debug/HandlerCalculator';

export function handleRewardAdded(event: RewardAdded): void {
  handlerLogic(event.address.toHexString(), 'RewardAdded', event.transaction, event.block);
  const poolAddress = event.address
  const poolContract = PotPoolContract.bind(poolAddress)
  const rewardToken = poolContract.rewardToken()
  const rewardAmount = event.params.reward
  const rewardRate = poolContract.rewardRate()
  const periodFinish = poolContract.periodFinish()

  saveReward(poolAddress, rewardToken, rewardRate, periodFinish, rewardAmount, event.transaction, event.block)
  saveApyReward(poolAddress, rewardToken, rewardRate, periodFinish, rewardAmount, event.transaction, event.block)
}
