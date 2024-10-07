import { Address, BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  AutoStake,
  UserBalance,
  UserBalanceHistory,
  UserProfit,
  UserProfitHistory, UserTotalProfit,
  UserTransaction,
  Vault,
} from '../../generated/schema';
import { VaultContract } from "../../generated/templates/VaultListener/VaultContract";
import { pow, powBI } from '../utils/MathUtils';
import {
  BD_18,
  BD_ONE,
  BD_TEN,
  BD_ZERO,
  BI_18,
  BI_TEN,
  FARM_TOKEN_MAINNET,
  FARM_TOKEN_MATIC,
  I_FARM_TOKEN,
} from '../utils/Constant';
import { isIFarm } from "../utils/PlatformUtils";
import { getTransactionType, UNKNOWN_TRANSACTION_TYPE } from "../utils/UserBalanceUtils";
import { ERC20 } from '../../generated/Storage/ERC20';
import { AutoStakeContract } from '../../generated/templates/AutoStakeListner/AutoStakeContract';

export function createUserBalance(vaultAddress: Address, amount: BigInt, beneficary: Address, tx: ethereum.Transaction, block: ethereum.Block, isDeposit: boolean): void {
  const vault = Vault.load(vaultAddress.toHex())
  // for iFarm we fetch in other function
  if (vault != null && !isIFarm(vault.name)) {
    const vaultContract = VaultContract.bind(vaultAddress)
    const tryPricePerFullShare = vaultContract.try_getPricePerFullShare()
    let sharePriceBD = BD_ONE
    let sharePrice = powBI(BI_TEN, vault.decimal.toI32())
    if (!tryPricePerFullShare.reverted) {
      sharePrice = tryPricePerFullShare.value
      sharePriceBD = sharePrice.divDecimal(pow(BD_TEN, vault.decimal.toI32()))
    }
    let poolBalance = BigDecimal.zero()
    if (vault.pool != null) {
      const poolContract = ERC20.bind(Address.fromString(vault.pool!))
      poolBalance = poolContract.balanceOf(beneficary).divDecimal(pow(BD_TEN, vault.decimal.toI32()))
    }
    const vaultBalance = vaultContract.balanceOf(beneficary).divDecimal(pow(BD_TEN, vault.decimal.toI32()))
    const value = vaultBalance.plus(poolBalance)

    const userBalanceId = `${vault.id}-${beneficary.toHex()}`
    let userBalance = UserBalance.load(userBalanceId)
    if (userBalance == null) {
      userBalance = new UserBalance(userBalanceId)
      userBalance.createAtBlock = block.number
      userBalance.timestamp = block.timestamp
      userBalance.vault = vault.id
      userBalance.value = BigDecimal.zero()
      userBalance.userAddress = beneficary.toHex()
      userBalance.underlyingBalance = BigDecimal.zero()
      if (vault.id == I_FARM_TOKEN.toHex()) {
        userBalance.additionalValues = [BigDecimal.zero(), BigDecimal.zero()]
      } else {
        userBalance.additionalValues = [BigDecimal.zero()]
      }
    }

    if (vault.id  == I_FARM_TOKEN.toHex()) {
      userBalance.additionalValues = [value, userBalance.additionalValues[1]]
      userBalance.value = value.plus(
        userBalance.additionalValues[1]
      )
    } else {
      userBalance.value = value
    }
    userBalance.poolBalance = poolBalance
    userBalance.vaultBalance = vaultBalance

    const delimiter = pow(BD_TEN, vault.decimal.toI32());
    const sharePriceFormatted = vault.lastSharePrice.divDecimal(delimiter);
    if (isDeposit) {
      userBalance.underlyingBalance = userBalance.underlyingBalance.plus(amount.divDecimal(delimiter).times(sharePriceFormatted))
    } else {
      userBalance.underlyingBalance = userBalance.underlyingBalance.minus(amount.divDecimal(delimiter).times(sharePriceFormatted))
    }

    let profit = BigDecimal.zero();
    if (userBalance.underlyingBalance.lt(BigDecimal.zero())) {
      profit = userBalance.underlyingBalance.neg().times(vault.priceUnderlying)
      userBalance.underlyingBalance = BigDecimal.zero()
    }

    userBalance.save()

    const userBalanceHistoryId = `${tx.hash.toHex()}-${beneficary.toHex()}-${vault.id}-${isDeposit.toString()}`
    const userTransactionId = tx.hash.toHex();
    const createdAtBlock = block.number
    const timestamp = block.timestamp
    const userAddress = beneficary.toHex()
    const vaultAddressString = vault.id
    const transactionType = getTransactionType(isDeposit)

    if (profit.gt(BigDecimal.zero())) {

      // calculate user profit
      let userProfit = UserProfit.load(userBalanceId);
      if (userProfit == null) {
        userProfit = new UserProfit(userBalanceId);
        userProfit.userAddress = beneficary.toHex();
        userProfit.vault = vault.id;
        userProfit.value = BigDecimal.zero();
      }
      userProfit.value = userProfit.value.plus(profit)
      userProfit.save();

      // calculate user profit history
      const historyId = `${tx.hash.toHex()}-${beneficary.toHex()}-${vault.id}-${isDeposit.toString()}`;
      const userProfitHistory = new UserProfitHistory(historyId);
      userProfitHistory.userAddress = beneficary.toHex();
      userProfitHistory.transactionType = transactionType
      userProfitHistory.vault = vault.id;
      userProfitHistory.value = userProfit.value;
      userProfitHistory.sharePrice = vault.lastSharePrice;
      userProfitHistory.transactionAmount = amount;
      userProfitHistory.createAtBlock = block.number
      userProfitHistory.timestamp = block.timestamp
      userProfitHistory.save();

      // total profit
      let userTotalProfit = UserTotalProfit.load(beneficary.toHex());
      if (userTotalProfit == null) {
        userTotalProfit = new UserTotalProfit(beneficary.toHex());
        userTotalProfit.value = BigDecimal.zero();
      }
      userTotalProfit.value = userTotalProfit.value.plus(profit)
      userTotalProfit.save();
    }

    createBalanceHistory(
      userBalanceHistoryId,
      vault,
      timestamp,
      createdAtBlock,
      userAddress,
      transactionType,
      sharePrice,
      userBalance.value,
      userBalance.additionalValues,
      poolBalance,
      vaultBalance,
      userBalance.underlyingBalance
    )
    createUserTransaction(userTransactionId, vaultAddressString, timestamp, createdAtBlock, userAddress, transactionType, sharePriceBD, amount)
  }
}

// only for iFarm
export function createIFarmUserBalance(vaultAddress: Address, beneficary: Address, tx: ethereum.Transaction, block: ethereum.Block, isDeposit: boolean, amount: BigInt): void {
  const vault = Vault.load(vaultAddress.toHex())
  if (vault != null) {
    const vaultContract = VaultContract.bind(vaultAddress)
    // TODO call
    const tryPricePerFullShare = vaultContract.try_getPricePerFullShare()
    let sharePriceBD = BD_ONE
    let sharePrice = powBI(BI_TEN, vault.decimal.toI32())
    if (!tryPricePerFullShare.reverted) {
      sharePrice = tryPricePerFullShare.value
      sharePriceBD = sharePrice.divDecimal(pow(BD_TEN, vault.decimal.toI32()))
    }
    // const vaultBalance = vaultContract.balanceOf(beneficary).divDecimal(pow(BD_TEN, vault.decimal.toI32())).times(sharePriceBD)
    // TODO call
    const vaultBalance = vaultContract.balanceOf(beneficary).divDecimal(pow(BD_TEN, vault.decimal.toI32()))

    const userBalanceId = `${vault.id}-${beneficary.toHex()}`
    let userBalance = UserBalance.load(userBalanceId)
    if (userBalance == null) {
      userBalance = new UserBalance(userBalanceId)
      userBalance.createAtBlock = block.number
      userBalance.timestamp = block.timestamp
      userBalance.vault = vault.id
      userBalance.value = BigDecimal.zero()
      userBalance.userAddress = beneficary.toHex()
      userBalance.additionalValues = [BigDecimal.zero(), BigDecimal.zero()]
      userBalance.poolBalance = BigDecimal.zero()
      userBalance.vaultBalance = BigDecimal.zero()
      userBalance.underlyingBalance = BigDecimal.zero()
    }

    userBalance.additionalValues = [vaultBalance, userBalance.additionalValues[1]]
    // OLD LOGIC
    // userBalance.value = vaultBalance.plus(
    //   userBalance.additionalValues[1]
    // )
    userBalance.value = vaultBalance;

    const delimiter = pow(BD_TEN, vault.decimal.toI32());
    const sharePriceFormatted = vault.lastSharePrice.divDecimal(delimiter);
    if (isDeposit) {
      userBalance.underlyingBalance = userBalance.underlyingBalance.plus(amount.divDecimal(delimiter).times(sharePriceFormatted))
    } else {
      userBalance.underlyingBalance = userBalance.underlyingBalance.minus(amount.divDecimal(delimiter).times(sharePriceFormatted))
    }

    let profit = BigDecimal.zero();
    if (userBalance.underlyingBalance.lt(BigDecimal.zero())) {
      profit = userBalance.underlyingBalance.neg().times(vault.priceUnderlying)
      userBalance.underlyingBalance = BigDecimal.zero()
    }

    userBalance.save()


    const transactionType = UNKNOWN_TRANSACTION_TYPE
    const userBalanceHistoryId = `${tx.hash.toHex()}-${beneficary.toHex()}-${vault.id}-${transactionType.toString()}`
    const userTransactionId = `${tx.hash.toHex()}-${vault.id}-${transactionType.toString()}`;
    const createdAtBlock = block.number
    const timestamp = block.timestamp
    const userAddress = beneficary.toHex()
    const vaultAddressString = vault.id

    if (profit.gt(BigDecimal.zero())) {

      // calculate user profit
      let userProfit = UserProfit.load(userBalanceId);
      if (userProfit == null) {
        userProfit = new UserProfit(userBalanceId);
        userProfit.userAddress = beneficary.toHex();
        userProfit.vault = vault.id;
        userProfit.value = BigDecimal.zero();
      }
      userProfit.value = userProfit.value.plus(profit)
      userProfit.save();

      // calculate user profit history
      const historyId = `${tx.hash.toHex()}-${beneficary.toHex()}-${vault.id}-${isDeposit.toString()}`;
      const userProfitHistory = new UserProfitHistory(historyId);
      userProfitHistory.userAddress = beneficary.toHex();
      userProfitHistory.transactionType = transactionType
      userProfitHistory.vault = vault.id;
      userProfitHistory.value = userProfit.value;
      userProfitHistory.sharePrice = vault.lastSharePrice;
      userProfitHistory.transactionAmount = amount;
      userProfitHistory.createAtBlock = block.number
      userProfitHistory.timestamp = block.timestamp
      userProfitHistory.save();

      // total profit
      let userTotalProfit = UserTotalProfit.load(beneficary.toHex());
      if (userTotalProfit == null) {
        userTotalProfit = new UserTotalProfit(beneficary.toHex());
        userTotalProfit.value = BigDecimal.zero();
      }
      userTotalProfit.value = userTotalProfit.value.plus(profit)
      userTotalProfit.save();
    }


    createBalanceHistory(
      userBalanceHistoryId,
      vault,
      timestamp,
      createdAtBlock,
      userAddress,
      transactionType,
      sharePrice,
      userBalance.value,
      userBalance.additionalValues,
      BigDecimal.zero(),
      BigDecimal.zero(),
      userBalance.underlyingBalance
    )
    createUserTransaction(userTransactionId, vaultAddressString, timestamp, createdAtBlock, userAddress, transactionType, sharePriceBD, vaultBalance.digits)
  }
}

function createBalanceHistory(
  id: string,
  vault: Vault,
  timestamp: BigInt,
  createdAtBlock: BigInt,
  userAddress: string,
  type: string,
  sharePrice: BigInt,
  value: BigDecimal,
  additionalValues: BigDecimal[],
  poolBalance: BigDecimal,
  vaultBalance: BigDecimal,
  underlyingBalance: BigDecimal
  ): void {
  const userBalanceHistory = new UserBalanceHistory(id)
  userBalanceHistory.createAtBlock = createdAtBlock
  userBalanceHistory.timestamp = timestamp
  userBalanceHistory.userAddress = userAddress
  userBalanceHistory.vault = vault.id
  userBalanceHistory.transactionType = type
  userBalanceHistory.sharePrice = sharePrice
  userBalanceHistory.priceUnderlying = vault.priceUnderlying
  userBalanceHistory.underlyingBalance = underlyingBalance
  userBalanceHistory.value = value
  userBalanceHistory.poolBalance = poolBalance
  userBalanceHistory.vaultBalance = vaultBalance
  userBalanceHistory.additionalValues = additionalValues
  userBalanceHistory.save()
}

function createUserTransaction(
  tx: string,
  vault: string,
  timestamp: BigInt,
  createdAtBlock: BigInt,
  userAddress: string,
  type: string,
  sharePrice: BigDecimal,
  value: BigInt
): void {
  const userTransaction = new UserTransaction(`${tx}-${vault}-${type}`);
  userTransaction.createAtBlock = createdAtBlock
  userTransaction.timestamp = timestamp
  userTransaction.userAddress = userAddress
  userTransaction.vault = vault
  userTransaction.transactionType = type
  userTransaction.sharePrice = sharePrice
  userTransaction.value = value
  userTransaction.save()
}
