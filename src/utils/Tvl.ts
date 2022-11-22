import { Address, BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Tvl, Vault } from "../../generated/schema";
import { fetchContractDecimal, fetchContractTotalSupply } from "./ERC20";
import { getPriceByVault, getPriceForCoin } from "./Price";
import {
  BD_18,
  BD_ZERO,
  BI_18,
  EXCLUSIVE_REWARD_POOL,
  getFarmToken,
  isPsAddress,
  SECONDS_OF_YEAR,
  YEAR_PERIOD
} from "./Constant";
import { fetchPricePerFullShare } from "./Vault";
import { pow } from "./Math";

export function createTvl(address: Address, transaction: ethereum.Transaction, block: ethereum.Block): void {
  const vaultAddress = address;
  const vault = Vault.load(vaultAddress.toHex())
  if (vault != null) {
    const id = `${transaction.hash.toHex()}-${vaultAddress.toHex()}`
    let tvl = Tvl.load(id)
    if (tvl == null) {
      tvl = new Tvl(id);

      tvl.vault = vault.id
      tvl.timestamp = block.timestamp
      tvl.createAtBlock = block.number
      let totalSupply = BigInt.zero()
      let price = BigDecimal.zero()
      let sharePrice = BI_18

      if (isPsAddress(vault.id)) {
        totalSupply = fetchContractTotalSupply(EXCLUSIVE_REWARD_POOL)
        price = getPriceForCoin(getFarmToken(), block.number.toI32()).divDecimal(BD_18)
      } else {
        totalSupply = fetchContractTotalSupply(vaultAddress)
        sharePrice = fetchPricePerFullShare(vaultAddress)
        price = getPriceByVault(vault, block.number.toI32())
      }
      tvl.totalSupply = totalSupply

      const decimal = BigDecimal.fromString((10 ** vault.decimal.toI64()).toString())

      tvl.sharePrice = sharePrice
      tvl.sharePriceDivDecimal = BigDecimal.fromString(tvl.sharePrice.toString()).div(decimal)
      tvl.decimal = decimal

      tvl.priceUnderlying = price

      if (price.gt(BigDecimal.zero())) {
        tvl.value = tvl.totalSupply.toBigDecimal()
          .div(decimal)
          .times(price)
          .times(tvl.sharePriceDivDecimal)
      } else {
        tvl.value = BD_ZERO;
      }
      tvl.save()
    }
  }
}

export function calculateTvlUsd(vaultAddress: Address, price: BigDecimal): BigDecimal {
  if (price.le(BigDecimal.zero())) {
    return BD_ZERO
  }
  const totalSupply = fetchContractTotalSupply(vaultAddress).toBigDecimal()
  const decimal = fetchContractDecimal(vaultAddress)
  const tempDecimal = pow(BigDecimal.fromString('10'), decimal.toI32())
  const sharePriceDivDecimal = fetchPricePerFullShare(vaultAddress).toBigDecimal().div(tempDecimal)

  return totalSupply.div(tempDecimal).times(price).times(sharePriceDivDecimal)
}