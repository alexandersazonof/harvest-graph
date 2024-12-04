import { saveReward } from "./types/Reward";
import { saveApyReward } from "./types/Apy";
import {
  ExclusiveRewardPoolContract, InitExclusiveCall,
  RewardAdded
} from "../generated/ExclusiveRewardPoolListener/ExclusiveRewardPoolContract";
import { Address, BigDecimal, BigInt, Bytes, store } from '@graphprotocol/graph-ts';
import { AutoStake, RewardPaidEntity, TokenPrice } from '../generated/schema';
import { loadOrCreateVault } from "./types/Vault";
import { AutoStakeListner } from "../generated/templates";
import { loadOrCreateExclusiveRewardPool } from "./types/ExclusiveRewardPool";
import { handlerLogic } from './debug/HandlerCalculator';
import { RewardPaid } from '../generated/NoMintNotifyHelperListener/NoMintRewardPoolContract';
import { loadOrCreateERC20Token } from './types/Token';
import { BD_TEN, BI_EVERY_24_HOURS, FARM_TOKEN_MAINNET } from './utils/Constant';
import { getPriceForCoin } from './utils/PriceUtils';
import { pow } from './utils/MathUtils';

export function handleRewardAdded(event: RewardAdded): void {
  handlerLogic(event.address.toHexString(), 'RewardAdded', event.transaction, event.block);
  const poolAddress = event.address
  const pool = loadOrCreateExclusiveRewardPool(poolAddress, event.block)
  const vault = loadOrCreateVault(Address.fromString(pool.vault), event.block)
  vault.pool = pool.id
  vault.save()

  const poolContract = ExclusiveRewardPoolContract.bind(poolAddress)
  const rewardAmount = event.params.reward
  const rewardToken = poolContract.rewardToken()
  const rewardRate = poolContract.rewardRate()
  const periodFinish = poolContract.periodFinish()

  saveReward(poolAddress, rewardToken, rewardRate, periodFinish, rewardAmount, event.transaction, event.block)
  saveApyReward(poolAddress, rewardToken, rewardRate, periodFinish, rewardAmount, event.transaction, event.block)
}

export function handleInitExclusive(call: InitExclusiveCall): void {
  const autoStakeAddress = call.inputs._exclusive
  let autoStack = AutoStake.load(autoStakeAddress.toHex())
  if (autoStack == null) {
    autoStack = new AutoStake(autoStakeAddress.toHex())
    autoStack.timestamp = call.block.timestamp
    autoStack.createAtBlock = call.block.number
    autoStack.save()
    AutoStakeListner.create(autoStakeAddress)
    loadOrCreateVault(autoStakeAddress, call.block)
  }
}

export function handleRewardPaid(event: RewardPaid): void {
  const rewardPaid = new RewardPaidEntity(Bytes.fromUTF8(`${event.transaction.hash.toHex()}-${event.logIndex.toString()}`));
  rewardPaid.userAddress = event.params.user.toHexString();
  rewardPaid.pool = loadOrCreateExclusiveRewardPool(event.address, event.block).id;
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