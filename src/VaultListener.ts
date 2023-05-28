import {
  Approval,
  Deposit,
  Withdraw,
} from "../generated/templates/VaultListener/VaultContract";
import { createTvl } from "./types/Tvl";
import { createUserBalance } from "./types/UserBalance";
import { Invest } from "../generated/Controller/VaultContract";
import { Transfer } from '../generated/Storage/ERC20';

export function handleDeposit(event: Deposit): void {
  // createTvl(event.address, event.block, event.transaction)
  createUserBalance(event.address, event.params.amount, event.params.beneficiary, event.transaction, event.block, true)
}

export function handleWithdraw(event: Withdraw): void {
  // createTvl(event.address, event.block, event.transaction)
  createUserBalance(event.address, event.params.amount, event.params.beneficiary, event.transaction, event.block, false)
}

export function handleInvest(event: Invest): void {
  createTvl(event.address, event.block, event.transaction)
}

export function handleApproval(event: Approval): void {
  // createTvl(event.address, event.block, event.transaction)
}

export function handleTransfer(event: Transfer): void {
  createTvl(event.address, event.block, event.transaction)
}