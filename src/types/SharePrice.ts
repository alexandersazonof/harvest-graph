import { BigInt, log } from "@graphprotocol/graph-ts";
import { SharePrice } from "../../generated/schema";


export function loadOrCreateSharePrice(id: string,
                                       oldSharePrice: BigInt,
                                       newSharePrice: BigInt,
                                       vault: string,
                                       strategy: string | null,
                                       timestamp: BigInt,
                                       createdAtBlock: BigInt
): SharePrice {
  let sharePrice = SharePrice.load(id)
  if (sharePrice == null) {
    log.log(log.Level.INFO, `Create new sharePrice for vault: ${vault}`)
    let sharePrice = new SharePrice(id)
    sharePrice.vault = vault;
    sharePrice.strategy = strategy;
    sharePrice.oldSharePrice = oldSharePrice;
    sharePrice.newSharePrice = newSharePrice;
    sharePrice.createAtBlock = createdAtBlock;
    sharePrice.timestamp = timestamp;
    sharePrice.save();
    return sharePrice;
  }
  return sharePrice;
}