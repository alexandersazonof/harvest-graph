import { createTvl } from "./types/Tvl";
import { Staked, Withdrawn } from "../generated/ExclusiveRewardPoolListener/ExclusiveRewardPoolContract";
import { createUserBalanceForFarm } from "./types/UserBalance";
import { handlerLogic } from './debug/HandlerCalculator';

export function handleStaked(event: Staked): void {
  handlerLogic(event.address.toHexString(), 'Staked', event.transaction, event.block);
  createTvl(event.address, event.block, event.transaction)
  // createUserBalanceForFarm(event.params.amount, event.params.user, event.transaction, event.block, true, event.address)
}

export function handleWithdrawn(event: Withdrawn): void {
  handlerLogic(event.address.toHexString(), 'Withdrawn', event.transaction, event.block);
  createTvl(event.address, event.block, event.transaction)
  // createUserBalanceForFarm(event.params.amount, event.params.user, event.transaction, event.block, false, event.address)
}

