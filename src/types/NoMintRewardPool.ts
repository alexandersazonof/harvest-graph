import { Address, ethereum, log } from "@graphprotocol/graph-ts";
import { Pool, Vault } from "../../generated/schema";
import { NoMintRewardPoolContract } from "../../generated/NoMintNotifyHelperListener/NoMintRewardPoolContract";
import { loadOrCreateERC20Token } from "./Token";
import { NoMintPoolListener } from "../../generated/templates";
import { loadOrCreateVault } from "./Vault";

const TYPE = 'NoMintRewardPool';


export function loadOrCreateNoMintPool(noMintPoolAddress: Address, ethBlock: ethereum.Block): Pool {
  const pool = Pool.load(noMintPoolAddress.toHex())
  if (pool == null) {
    log.log(log.Level.INFO, `Create new pool ${TYPE}: ${noMintPoolAddress}`)
    let poolContract = NoMintRewardPoolContract.bind(noMintPoolAddress)
    let vaultAddress = poolContract.lpToken();
    let rewardTokenAddress = poolContract.rewardToken();
    let rewardToken = loadOrCreateERC20Token(rewardTokenAddress)
    let pool = new Pool(noMintPoolAddress.toHex())
    pool.timestamp = ethBlock.timestamp
    pool.createAtBlock = ethBlock.number
    pool.vault = vaultAddress.toHex()
    pool.type = TYPE
    pool.rewardTokens = [rewardToken.id]
    pool.save()

    let vault = Vault.load(vaultAddress.toHex())
    if (vault != null) {
      vault.pool = noMintPoolAddress.toHex()
      vault.save()
    } else {
      vault = loadOrCreateVault(vaultAddress, ethBlock)
      vault.pool = noMintPoolAddress.toHex()
      vault.save()
    }
    NoMintPoolListener.create(noMintPoolAddress)
    return pool
  }
  return pool
}