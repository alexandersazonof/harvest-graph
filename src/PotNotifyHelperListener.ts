import { NotifyPoolsCall } from "../generated/PotNotifyHelperListener/PotNotifyHelperContract";
import { loadOrCreatePotPool } from "./types/PotPool";

export function handlePotNotifyPools(call: NotifyPoolsCall): void {
  const pools = call.inputs.pools
  for (let i = 0; i < pools.length; i++) {
    loadOrCreatePotPool(pools[i], call.block)
  }
}