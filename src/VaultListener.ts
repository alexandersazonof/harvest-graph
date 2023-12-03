import {
  Approval,
  Deposit,
  Withdraw,
} from "../generated/templates/VaultListener/VaultContract";
import { createTvl } from "./types/Tvl";
import { createUserBalance } from './types/UserBalance';
import { Transfer } from '../generated/Storage/ERC20';
import { Invest } from '../generated/Storage/VaultContract';
import { handlerLogic } from './debug/HandlerCalculator';
import { Vault } from '../generated/schema';
import { isFarmContract, isIFarm } from './utils/PlatformUtils';

export function handleDeposit(event: Deposit): void {
  handlerLogic(event.address.toHexString(), 'Deposit', event.transaction, event.block);
}

export function handleWithdraw(event: Withdraw): void {
  handlerLogic(event.address.toHexString(), 'Withdraw', event.transaction, event.block);
}

export function handleInvest(event: Invest): void {
  handlerLogic(event.address.toHexString(), 'Invest', event.transaction, event.block);
}

export function handleTransfer(event: Transfer): void {
  handlerLogic(event.address.toHexString(), 'Transfer', event.transaction, event.block);
  createTvl(event.address, event.block, event.transaction)

  const vault = Vault.load(event.address.toHex());
  if (vault) {
    if (!isFarmContract(vault.id)) {
      createUserBalance(event.address, event.params.value, event.params.from, event.transaction, event.block, true)
      createUserBalance(event.address, event.params.value, event.params.to, event.transaction, event.block, false)
    }
  }
}