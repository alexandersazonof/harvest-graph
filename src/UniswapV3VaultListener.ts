import { SharePriceChangeLiquidation } from "../generated/PotNotifyHelperListener/UniswapV3VaultContract";
import { calculateAndSaveApyAutoCompound } from "./types/Apy";
import { Vault } from "../generated/schema";
import { BD_TEN, NULL_ADDRESS } from "./utils/Constant";
import { pow } from "./utils/MathUtils";
import { Transfer } from '../generated/Storage/ERC20';
import { createTvl } from "./types/Tvl";
import { loadOrCreateSharePrice } from "./types/SharePrice";

export function handleSharePriceChangeLiquidation(event: SharePriceChangeLiquidation): void {
  const address = event.address
  const oldSharePrice = event.params.oldPrice
  const newSharePrice = event.params.newPrice;
  const block = event.block.number;
  const timestamp = event.block.timestamp;


  const diffSharePrice = newSharePrice.minus(oldSharePrice)
  const diffTimestamp = event.params.newTimestamp.minus(event.params.previousTimestamp)
  const vault = Vault.load(address.toHex())
  if (vault != null) {
    if (!vault.lastShareTimestamp.isZero()) {
      const sharePriceNumber = diffSharePrice.divDecimal(pow(BD_TEN, vault.decimal.toI32()))
      const apy = calculateAndSaveApyAutoCompound(`${event.transaction.hash.toHex()}-${vault.id}`, sharePriceNumber, diffTimestamp, address.toHex(), event.block)
    }

    vault.lastSharePrice = event.params.newPrice
    vault.lastShareTimestamp = event.params.newTimestamp
    vault.save()

    const sharePrice = loadOrCreateSharePrice(
      `${event.transaction.hash.toHex()}-${address.toHex()}`,
      oldSharePrice,
      newSharePrice,
      vault.id,
      vault.strategy,
      timestamp,
      block
    )
  }
}

export function handleTransfer(event: Transfer): void {
  createTvl(event.address, event.block, event.transaction)
}