import { Deposit, Withdraw } from "../generated/templates/VaultListener/VaultContract";
import { createTvl } from "./utils/Tvl";
import { Staked, Withdrawn } from "../generated/ExclusiveRewardPoolListener/ExclusiveRewardPoolContract";
import { createUserBalance, createUserBalanceForFarm } from "./utils/User";
import { FARM_TOKEN_MAINNET, I_FARM_TOKEN } from "./utils/Constant";

export function handleStaked(event: Staked): void {
  createTvl(event.address, event.transaction, event.block)
  createUserBalanceForFarm(event.params.amount, event.params.user, event.transaction, event.block, true)
}

export function handleWithdrawn(event: Withdrawn): void {
  createTvl(event.address, event.transaction, event.block)
  createUserBalanceForFarm(event.params.amount, event.params.user, event.transaction, event.block, false)
}