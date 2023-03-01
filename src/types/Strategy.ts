import { Address, ethereum } from "@graphprotocol/graph-ts";
import { Strategy, Vault } from "../../generated/schema";

export function loadOrCreateStrategy(strategyAddress: Address, block: ethereum.Block): Strategy {
  let strategy = Strategy.load(strategyAddress.toHex());
  if (strategy == null) {
    strategy = new Strategy(strategyAddress.toHex());
    strategy.timestamp = block.timestamp;
    strategy.createAtBlock = block.number;
    strategy.save();
  }
  return strategy;
}