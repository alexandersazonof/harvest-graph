import { createTvl } from "./types/Tvl";
import { Staked, Withdrawn } from "../generated/ExclusiveRewardPoolListener/ExclusiveRewardPoolContract";
import { handlerLogic } from './debug/HandlerCalculator';

export function handleStaked(event: Staked): void {
  // handlerLogic(event.address.toHexString(), 'Staked', event.transaction, event.block);
  createTvl(event.address, event.block, event.transaction)
}

export function handleWithdrawn(event: Withdrawn): void {
  // handlerLogic(event.address.toHexString(), 'Withdrawn', event.transaction, event.block);
  createTvl(event.address, event.block, event.transaction)
}

