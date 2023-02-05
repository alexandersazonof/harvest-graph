import {
  Approval,
  Deposit, Transfer,
  Withdraw,
} from "../generated/templates/VaultListener/VaultContract";
import { createTvl } from "./utils/Tvl";
import { createUserBalance } from "./utils/User";
import { Invest } from "../generated/Controller/VaultContract";

export function handleDeposit(event: Deposit): void {
  createTvl(event.address, event.transaction, event.block)
  createUserBalance(event.address, event.params.amount, event.params.beneficiary, event.transaction, event.block, true)
}

export function handleWithdraw(event: Withdraw): void {
  createTvl(event.address, event.transaction, event.block)
  createUserBalance(event.address, event.params.amount, event.params.beneficiary, event.transaction, event.block, false)
}

export function handleInvest(event: Invest): void {
  createTvl(event.address, event.transaction, event.block)
}

export function handleApproval(event: Approval): void {
  createTvl(event.address, event.transaction, event.block)
}

// export function handleTransfer(event: Transfer): void {
//   createTvl(event.address, event.transaction, event.block)
//   createUserBalance(event.address, event.params.value, event.params.to, event.transaction, event.block, true)
//   createUserBalance(event.address, event.params.value, event.params.from, event.transaction, event.block, false)
// }