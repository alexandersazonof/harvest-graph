import { SetControllerCall } from "../generated/Storage/StorageContract";
import { loadOrCreateController } from "./types/Controller";
import { Address, ethereum } from '@graphprotocol/graph-ts';
import { getVaultUtils, loadOrCreateVault } from './types/Vault';
import { getPriceByVault } from './utils/PriceUtils';
import { PriceHistory } from '../generated/schema';

export function handleSetController(call: SetControllerCall): void {
  const controller = loadOrCreateController(call.inputs._controller, call.block)
}

export function handleBlock(block: ethereum.Block): void {
  const vaultUtils = getVaultUtils();
  for (let i = 0; i < vaultUtils.vaults.length; i++) {
    const vault = loadOrCreateVault(Address.fromString(vaultUtils.vaults[i]), block);
    const price = getPriceByVault(vault, block);

    const priceHistoryId = `${vault.id}-${block.number.toString()}`
    let priceHistory = PriceHistory.load(priceHistoryId)
    if (!priceHistory) {
      priceHistory = new PriceHistory(priceHistoryId);
      priceHistory.vault = vault.id
      priceHistory.price = price;
      priceHistory.createAtBlock = block.number
      priceHistory.timestamp = block.timestamp
      priceHistory.save();
    }

    vault.priceUnderlying = price
    vault.save();
  }
}