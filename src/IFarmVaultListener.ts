import { createIFarmUserBalance, createUserBalance } from "./types/UserBalance";
import { Transfer } from '../generated/Storage/ERC20';

export function handleTransfer(event: Transfer): void {
  createIFarmUserBalance(event.address, event.params.from, event.transaction, event.block)
  createIFarmUserBalance(event.address, event.params.to, event.transaction, event.block)
}