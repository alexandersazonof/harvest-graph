import { RewardAdded, RewardPaid } from "../generated/NoMintNotifyHelperListener/NoMintRewardPoolContract";
import { NoMintPoolContract } from "../generated/templates/NoMintPoolListener/NoMintPoolContract";
import { saveReward } from "./types/Reward";
import { saveApyReward } from "./types/Apy";
import { BD_TEN, BI_EVERY_24_HOURS, FARM_TOKEN_MAINNET } from './utils/Constant';
import { pow } from './utils/MathUtils';
import { BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts';
import { getPriceForCoin } from './utils/PriceUtils';
import { RewardPaidEntity, TokenPrice } from '../generated/schema';
import { loadOrCreateERC20Token } from './types/Token';
import { loadOrCreatePotPool } from './types/PotPool';
import { store } from '@graphprotocol/graph-ts';
import { loadOrCreateNoMintPool } from './types/NoMintRewardPool';

export function handleRewardAdded(event: RewardAdded): void {
  const poolAddress = event.address
  const poolContract = NoMintPoolContract.bind(poolAddress)
  const rewardAmount = event.params.reward
  const rewardToken = poolContract.rewardToken()
  const rewardRate = poolContract.rewardRate()
  const periodFinish = poolContract.periodFinish()

  saveReward(poolAddress, rewardToken, rewardRate, periodFinish, rewardAmount, event.transaction, event.block)
  saveApyReward(poolAddress, rewardToken, rewardRate, periodFinish, rewardAmount, event.transaction, event.block)
}

export function handleRewardPaid(event: RewardPaid): void {
  const rewardPaid = new RewardPaidEntity(Bytes.fromUTF8(`${event.transaction.hash.toHex()}-${event.logIndex.toString()}`));
  rewardPaid.userAddress = event.params.user.toHexString();
  rewardPaid.pool = loadOrCreateNoMintPool(event.address, event.block).id;
  rewardPaid.value = event.params.reward;
  // price
  const rewardToken = loadOrCreateERC20Token(FARM_TOKEN_MAINNET);
  // TODO move logic token price for all project
  const tokenPriceId = FARM_TOKEN_MAINNET.toHexString();
  let tokenPrice = TokenPrice.load(tokenPriceId);
  if (tokenPrice == null) {
    tokenPrice = new TokenPrice(tokenPriceId);
    const price = getPriceForCoin(FARM_TOKEN_MAINNET, event.block.number.toI32());
    let priceBD = BigDecimal.zero();

    if (price.gt(BigInt.zero())) {
      priceBD = price.divDecimal(pow(BD_TEN, rewardToken.decimals));
    }
    tokenPrice.price = priceBD;
    tokenPrice.timestamp = event.block.timestamp;
    tokenPrice.save();
  }

  rewardPaid.price = tokenPrice.price;
  rewardPaid.token = rewardToken.id;
  rewardPaid.timestamp = event.block.timestamp;
  rewardPaid.createAtBlock = event.block.number;
  rewardPaid.save();

  if (tokenPrice.timestamp.plus(BI_EVERY_24_HOURS).lt(event.block.timestamp)) {
    store.remove('TokenPrice', tokenPriceId);
  }
}