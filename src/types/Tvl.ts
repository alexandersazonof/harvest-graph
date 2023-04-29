import { Address, BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { TotalTvl, TotalTvlHistory, TotalTvlHistoryV2, Tvl, Vault } from '../../generated/schema';
import { fetchContractDecimal, fetchContractTotalSupply } from "../utils/ERC20Utils";
import { getPriceByVault, getPriceForCoin } from "../utils/PriceUtils";
import {
  BD_18,
  BD_ZERO,
  BI_18,
  EXCLUSIVE_REWARD_POOL,
  getFarmToken,
  isPsAddress,
} from "../utils/Constant";
import { fetchPricePerFullShare } from "../utils/VaultUtils";
import { pow } from "../utils/MathUtils";

export function createTvl(address: Address, block: ethereum.Block): Tvl | null {
  const vaultAddress = address;
  const vault = Vault.load(vaultAddress.toHex())
  if (vault != null) {
    const id = `${block.number.toString()}-${vaultAddress.toHex()}`
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
      const sharePriceDivDecimal = sharePrice.divDecimal(decimal)

      tvl.sharePrice = sharePrice
      tvl.priceUnderlying = price
      if (price.gt(BigDecimal.zero())) {
        tvl.value = tvl.totalSupply.toBigDecimal()
          .div(decimal)
          .times(price)
          .times(sharePriceDivDecimal)
      } else {
        tvl.value = BD_ZERO;
      }
      tvl.save()

      createTotalTvl(vault.tvl, tvl.value, id, block)
      vault.tvl = tvl.value
      vault.save()
    }
    return tvl;
  }
  return null;
}

export function calculateTvlUsd(vaultAddress: Address, price: BigDecimal, transaction: ethereum.Transaction, block: ethereum.Block): BigDecimal {
  if (price.le(BigDecimal.zero())) {
    return BD_ZERO
  }
  const vault = Vault.load(vaultAddress.toHex())
  if (vault != null) {
    const totalSupply = fetchContractTotalSupply(vaultAddress)
    const decimal = fetchContractDecimal(vaultAddress)
    const tempDecimal = pow(BigDecimal.fromString('10'), decimal.toI32())
    const sharePrice = fetchPricePerFullShare(vaultAddress)
    const sharePriceDivDecimal = sharePrice.divDecimal(tempDecimal)
    const value = totalSupply.divDecimal(tempDecimal).times(price).times(sharePriceDivDecimal)
    const id = `${transaction.hash.toHex()}-${vaultAddress.toHex()}`
    let tvl = Tvl.load(id)
    if (tvl == null) {
      tvl = new Tvl(id)
      tvl.vault = vault.id
      tvl.timestamp = block.timestamp
      tvl.createAtBlock = block.number
      tvl.totalSupply = totalSupply
      tvl.sharePrice = sharePrice
      tvl.priceUnderlying = price
      tvl.value = value
      tvl.save()

      createTotalTvl(vault.tvl, tvl.value, id, block)
      vault.tvl = tvl.value
      vault.save()

      createTotalTvl(vault.tvl, tvl.value, id, block)
      vault.tvl = tvl.value
      vault.save()
    }
    return value
  }
  return BigDecimal.zero()
}


export function createTotalTvl(oldValue:BigDecimal, newValue: BigDecimal, id: string, block: ethereum.Block): void {
  const defaultId = '1';
  let totalTvl = TotalTvl.load(defaultId)
  if (totalTvl == null) {
    totalTvl = new TotalTvl(defaultId)
    totalTvl.value = BigDecimal.zero()
    totalTvl.save()
  }

  totalTvl.value = totalTvl.value.minus(oldValue).plus(newValue);
  totalTvl.save()

  let totalTvlHistory = TotalTvlHistory.load(id)
  if (totalTvlHistory == null) {
    totalTvlHistory = new TotalTvlHistory(id)

    totalTvlHistory.value = totalTvl.value
    totalTvlHistory.timestamp = block.timestamp
    totalTvlHistory.createAtBlock = block.number
    totalTvlHistory.save()
  }
}


export function createTvlV2(totalTvl: BigDecimal, block: ethereum.Block): void {
  let totalTvlHistory = TotalTvlHistoryV2.load(block.number.toHex())
  if (totalTvlHistory == null) {
    totalTvlHistory = new TotalTvlHistoryV2(block.number.toHex())

    totalTvlHistory.value = totalTvl
    totalTvlHistory.timestamp = block.timestamp
    totalTvlHistory.createAtBlock = block.number
    totalTvlHistory.save()
  }
}