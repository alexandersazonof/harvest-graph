import { Vault } from "../generated/schema";
import { loadOrCreateVault } from "./types/Vault";
import { pow } from "./utils/MathUtils";
import { BD_TEN } from "./utils/Constant";
import { calculateAndSaveApyAutoCompound } from "./types/Apy";
import { BigInt } from "@graphprotocol/graph-ts";
import { loadOrCreateStrategy } from "./types/Strategy";
import { loadOrCreateSharePrice } from "./types/SharePrice";
import { AddVaultAndStrategyCall, SharePriceChangeLog } from '../generated/Storage/ControllerContract';


export function handleSharePriceChangeLog(event: SharePriceChangeLog): void {
  const vaultAddress = event.params.vault.toHex();
  const strategyAddress = event.params.strategy.toHex();
  const block = event.block.number;
  const timestamp = event.block.timestamp;

  const sharePrice = loadOrCreateSharePrice(
    `${event.transaction.hash.toHex()}-${vaultAddress}`,
    event.params.oldSharePrice,
    event.params.newSharePrice,
    vaultAddress,
    strategyAddress,
    timestamp,
    block
  )

  const vault = Vault.load(vaultAddress)
  if (vault != null && sharePrice.oldSharePrice != sharePrice.newSharePrice) {
    const lastShareTimestamp = vault.lastShareTimestamp
    if (!lastShareTimestamp.isZero()) {
      const diffSharePrice = sharePrice.newSharePrice.minus(sharePrice.oldSharePrice).divDecimal(pow(BD_TEN, vault.decimal.toI32()))
      const diffTimestamp = timestamp.minus(lastShareTimestamp)
      const apy = calculateAndSaveApyAutoCompound(`${event.transaction.hash.toHex()}-${vaultAddress}`, diffSharePrice, diffTimestamp, vaultAddress, event.block)

      const apyCount = vault.apyAutoCompoundCount.plus(BigInt.fromI32(1))
      vault.apyAutoCompound = vault.apyAutoCompound.plus(apy).div(apyCount.toBigDecimal())
      vault.apyAutoCompoundCount = apyCount
    }

    vault.lastShareTimestamp = sharePrice.timestamp
    vault.lastSharePrice = sharePrice.newSharePrice
    vault.save()

  }
}

export function handleAddVaultAndStrategy(call: AddVaultAndStrategyCall): void {
  const vaultAddress = call.inputs._vault;
  const strategyAddress = call.inputs._strategy;
  const block = call.block;

  loadOrCreateStrategy(strategyAddress, block)
  loadOrCreateVault(vaultAddress, block, strategyAddress.toHex())
}
