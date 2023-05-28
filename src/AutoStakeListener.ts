import { createTvl } from "./types/Tvl";
import { Staked, Withdrawn } from "../generated/ExclusiveRewardPoolListener/ExclusiveRewardPoolContract";
import { createUserBalanceForFarm } from "./types/UserBalance";

export function handleStaked(event: Staked): void {
  createTvl(event.address, event.block, event.transaction)
  createUserBalanceForFarm(event.params.amount, event.params.user, event.transaction, event.block, true, event.address)
}

export function handleWithdrawn(event: Withdrawn): void {
  createTvl(event.address, event.block, event.transaction)
  createUserBalanceForFarm(event.params.amount, event.params.user, event.transaction, event.block, false, event.address)
}

