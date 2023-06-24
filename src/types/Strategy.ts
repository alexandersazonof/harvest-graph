import { Address, ethereum } from "@graphprotocol/graph-ts";
import { Strategy, Vault } from "../../generated/schema";
import { StrategyListener } from '../../generated/templates';
import { loadOrCreateVault } from './Vault';
import { StrategyContract } from '../../generated/templates/StrategyListener/StrategyContract';

export function loadOrCreateStrategy(strategyAddress: Address, block: ethereum.Block): Strategy {
  let strategy = Strategy.load(strategyAddress.toHex());
  if (strategy == null) {
    strategy = new Strategy(strategyAddress.toHex());
    strategy.vault = loadOrCreateVault(getVaultAddress(strategyAddress), block).id
    strategy.timestamp = block.timestamp;
    strategy.createAtBlock = block.number;
    strategy.save();
    StrategyListener.create(strategyAddress)
  }
  return strategy;
}

export function getVaultAddress(address: Address): Address {
  const tryVault = StrategyContract.bind(address).try_vault();
  return tryVault.reverted ? Address.zero() : tryVault.value;
}