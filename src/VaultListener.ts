import {
  Approval,
  Deposit,
  Withdraw,
} from "../generated/templates/VaultListener/VaultContract";
import { createTvl } from "./types/Tvl";
import { createUserBalance } from "./types/UserBalance";
import { Invest } from "../generated/Controller/VaultContract";

export function handleDeposit(event: Deposit): void {
  createTvl(event.address, event.block)
  createUserBalance(event.address, event.params.amount, event.params.beneficiary, event.transaction, event.block, true)
}

export function handleWithdraw(event: Withdraw): void {
  createTvl(event.address, event.block)
  createUserBalance(event.address, event.params.amount, event.params.beneficiary, event.transaction, event.block, false)
}

export function handleInvest(event: Invest): void {
  createTvl(event.address, event.block)
}

export function handleApproval(event: Approval): void {
  createTvl(event.address, event.block)
}