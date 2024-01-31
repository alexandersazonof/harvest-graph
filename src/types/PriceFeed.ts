import { PriceFeed, Vault } from '../../generated/schema';
import { BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { pow } from '../utils/MathUtils';
import { BD_TEN, FARM_TOKEN_MAINNET, I_FARM_TOKEN } from '../utils/Constant';
import { fetchPricePerFullShare } from '../utils/VaultUtils';

export function createPriceFeed(vault: Vault, price: BigDecimal, block: ethereum.Block): PriceFeed {
  const id = `${vault.id}-${block.number.toString()}`;
  let priceFeed = PriceFeed.load(id);
  if (!priceFeed) {
    priceFeed = new PriceFeed(id);
    priceFeed.vault = vault.id
    priceFeed.price = price;
    priceFeed.sharePrice = BigDecimal.fromString('1');
    priceFeed.value = BigDecimal.zero();
    priceFeed.createAtBlock = block.number
    priceFeed.timestamp = block.timestamp

    if (vault.lastSharePrice.gt(BigInt.zero())) {
      const sharePrice = vault.lastSharePrice.divDecimal(pow(BD_TEN, vault.decimal.toI32()))
      priceFeed.sharePrice = sharePrice;
      priceFeed.value = price.times(sharePrice);
    }

    // if farm ?
    if (vault.id == FARM_TOKEN_MAINNET.toHexString()) {
      const sharePrice = fetchPricePerFullShare(I_FARM_TOKEN).divDecimal(pow(BD_TEN, vault.decimal.toI32()))
      priceFeed.sharePrice = sharePrice;
      priceFeed.value = price.times(sharePrice);
    }
    priceFeed.save();
  }

  return priceFeed;
}