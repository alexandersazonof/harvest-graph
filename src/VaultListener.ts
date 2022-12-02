import { Deposit, Withdraw } from "../generated/templates/VaultListener/VaultContract";
import { createTvl } from "./utils/Tvl";
import { createUserBalance } from "./utils/Vault";

export function handleDeposit(event: Deposit): void {
  createTvl(event.address, event.transaction, event.block)
  createUserBalance(event.address, event.params.amount, event.params.beneficiary, event.transaction, event.block, true)
}

export function handleWithdraw(event: Withdraw): void {
  createTvl(event.address, event.transaction, event.block)
  createUserBalance(event.address, event.params.amount, event.params.beneficiary, event.transaction, event.block, false)
}