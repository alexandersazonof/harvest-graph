import { createIFarmUserBalance, createUserBalance } from "./utils/User";
import { Transfer } from "../generated/Controller/ERC20";

export function handleTransfer(event: Transfer): void {
  createIFarmUserBalance(event.address, event.params.from, event.transaction, event.block)
  createIFarmUserBalance(event.address, event.params.to, event.transaction, event.block)
}