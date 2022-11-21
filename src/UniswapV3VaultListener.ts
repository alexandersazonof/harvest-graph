import { SharePriceChangeLiquidation } from "../generated/PotNotifyHelperListener/UniswapV3VaultContract";
import { calculateAndSaveApyAutoCompound } from "./utils/Apy";
import { Vault } from "../generated/schema";
import { BD_TEN } from "./utils/Constant";
import { pow } from "./utils/Math";

export function handleSharePriceChangeLiquidation(event: SharePriceChangeLiquidation): void {
  const diffSharePrice = event.params.newPrice.minus(event.params.oldPrice)
  const diffTimestamp = event.params.newTimestamp.minus(event.params.previousTimestamp)
  const address = event.address
  const vault = Vault.load(address.toHex())
  if (vault != null) {
    if (!vault.lastShareTimestamp.isZero()) {
      const sharePrice = diffSharePrice.divDecimal(pow(BD_TEN, vault.decimal.toI32()))
      const apy = calculateAndSaveApyAutoCompound(`${event.transaction.hash.toHex()}-${vault.id}`, sharePrice, diffTimestamp, address.toHex(), event.block)

    }

    vault.lastSharePrice = event.params.newPrice
    vault.lastShareTimestamp = event.params.newTimestamp
    vault.save()
  }
}