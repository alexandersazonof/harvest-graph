import { Address, ethereum, log } from "@graphprotocol/graph-ts";
import { Pool } from "../../generated/schema";
import { loadOrCreateERC20Token } from "./Token";
import { ExclusiveRewardPoolContract } from "../../generated/ExclusiveRewardPoolListener/ExclusiveRewardPoolContract";

const TYPE = 'ExclusiveRewardPool'

export function loadOrCreateExclusiveRewardPool(exclusiveRewardPoolAddress: Address, ethBlock: ethereum.Block): Pool {
  let pool = Pool.load(exclusiveRewardPoolAddress.toHex())
  if (pool == null) {
    log.log(log.Level.INFO, `Create new pool ${TYPE}: ${exclusiveRewardPoolAddress}`)
    let exclusiveRewardPoolContract = ExclusiveRewardPoolContract.bind(exclusiveRewardPoolAddress)
    let vaultAddress = exclusiveRewardPoolContract.lpToken();
    let rewardTokenAddress = exclusiveRewardPoolContract.rewardToken();
    let rewardToken = loadOrCreateERC20Token(rewardTokenAddress)
    let pool = new Pool(exclusiveRewardPoolAddress.toHex())
    pool.timestamp = ethBlock.timestamp
    pool.createAtBlock = ethBlock.number
    pool.vault = vaultAddress.toHex()
    pool.type = TYPE
    pool.rewardTokens = [rewardToken.id]
    pool.save()
    return pool
  }

  return pool;
}