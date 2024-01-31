import { Address, BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { AutoStake, UserBalance, UserBalanceHistory, UserTransaction, Vault } from "../../generated/schema";
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

    userBalance.save()

    const userBalanceHistoryId = `${tx.hash.toHex()}-${beneficary.toHex()}`
    const userTransactionId = tx.hash.toHex();
    const createdAtBlock = block.number
    const timestamp = block.timestamp
    const userAddress = beneficary.toHex()
    const vaultAddressString = vault.id
    const transactionType = getTransactionType(isDeposit)

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
      vaultBalance
    )
    createUserTransaction(userTransactionId, vaultAddressString, timestamp, createdAtBlock, userAddress, transactionType, sharePriceBD, amount)
  }
}

// only for iFarm
export function createIFarmUserBalance(vaultAddress: Address, beneficary: Address, tx: ethereum.Transaction, block: ethereum.Block): void {
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
    }

    userBalance.additionalValues = [vaultBalance, userBalance.additionalValues[1]]
    // OLD LOGIC
    // userBalance.value = vaultBalance.plus(
    //   userBalance.additionalValues[1]
    // )
    userBalance.value = vaultBalance;

    userBalance.save()


    const userBalanceHistoryId = `${tx.hash.toHex()}-${beneficary.toHex()}`
    const userTransactionId = tx.hash.toHex();
    const createdAtBlock = block.number
    const timestamp = block.timestamp
    const userAddress = beneficary.toHex()
    const vaultAddressString = vault.id
    const transactionType = UNKNOWN_TRANSACTION_TYPE

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
      BigDecimal.zero()
    )
    createUserTransaction(userTransactionId, vaultAddressString, timestamp, createdAtBlock, userAddress, transactionType, sharePriceBD, vaultBalance.digits)
  }
}

// only for FARM token
export function createUserBalanceForFarm(amount: BigInt, beneficary: Address, tx: ethereum.Transaction, block: ethereum.Block, isDeposit: boolean, autoStake: Address): void {
  const vault = Vault.load(I_FARM_TOKEN.toHex())
  if (vault != null ) {
    const userBalanceId = `${vault.id}-${beneficary.toHex()}`
    const vaultContract = VaultContract.bind(I_FARM_TOKEN)
    // TODO call
    const trySharePrice = vaultContract.try_getPricePerFullShare()
    const sharePrice = trySharePrice.reverted
      ? powBI(BI_TEN, vault.decimal.toI32())
      : trySharePrice.value
    const sharePriceBD = sharePrice.toBigDecimal()
    const autoStakeContract = AutoStakeContract.bind(autoStake);
    // TODO call
    const tryBalanceOf = autoStakeContract.try_balanceOf(beneficary)

    let value = BigDecimal.zero()
    if (!tryBalanceOf.reverted) {
      value = tryBalanceOf.value.divDecimal(BD_18)
    }

    let userBalance = UserBalance.load(userBalanceId)
    if (userBalance == null) {
      userBalance = new UserBalance(userBalanceId)
      userBalance.createAtBlock = block.number
      userBalance.timestamp = block.timestamp
      userBalance.vault = vault.id
      userBalance.value = BigDecimal.zero()
      userBalance.additionalValues = [BigDecimal.zero(), BigDecimal.zero()]
      userBalance.userAddress = beneficary.toHex()
      userBalance.poolBalance = BigDecimal.zero()
      userBalance.vaultBalance = BigDecimal.zero()
    }

    userBalance.additionalValues = [userBalance.additionalValues[0], value]
    // userBalance.value = value.plus(userBalance.additionalValues[0])
    userBalance.value = value;
    userBalance.save()

    const userBalanceHistoryId = `${tx.hash.toHex()}-${beneficary.toHex()}`
    const userTransactionId = tx.hash.toHex();
    const createdAtBlock = block.number
    const timestamp = block.timestamp
    const userAddress = beneficary.toHex()
    const vaultAddress = vault.id
    const transactionType = getTransactionType(isDeposit)

    createBalanceHistory(userBalanceHistoryId, vault, timestamp, createdAtBlock, userAddress, transactionType, sharePrice, userBalance.value, userBalance.additionalValues, BigDecimal.zero(), BigDecimal.zero())
    createUserTransaction(userTransactionId, vaultAddress, timestamp, createdAtBlock, userAddress, transactionType, sharePriceBD, amount)
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
  ): void {
  const userBalanceHistory = new UserBalanceHistory(id)
  userBalanceHistory.createAtBlock = createdAtBlock
  userBalanceHistory.timestamp = timestamp
  userBalanceHistory.userAddress = userAddress
  userBalanceHistory.vault = vault.id
  userBalanceHistory.transactionType = type
  userBalanceHistory.sharePrice = sharePrice
  userBalanceHistory.priceUnderlying = vault.priceUnderlying
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
  const userTransaction = new UserTransaction(tx)
  userTransaction.createAtBlock = createdAtBlock
  userTransaction.timestamp = timestamp
  userTransaction.userAddress = userAddress
  userTransaction.vault = vault
  userTransaction.transactionType = type
  userTransaction.sharePrice = sharePrice
  userTransaction.value = value
  userTransaction.save()
}


function updateVaultUsers(vault: Vault, value: BigDecimal, userAddress: string): void {
  let users = vault.users;
  if (value.equals(BigDecimal.zero())) {
    let newUsers: string[] = [];
    for (let i = 0; i < users.length; i++) {
      if (users[i].toLowerCase() != userAddress.toLowerCase()) {
        newUsers.push(users[i])
      }
    }
    users = newUsers;
  } else {
    let hasUser = false;
    for (let i = 0; i < users.length; i++) {
      if (userAddress.toLowerCase() == users[i].toLowerCase()) {
        hasUser = true;
        break;
      }
    }

    if (!hasUser) {
      users.push(userAddress)
    }
  }
  vault.users = users;
  vault.save()
}

export function addVaultUser(vault: Vault, userAddress: string): void {
  let users = vault.users;
  let hasUser = false;
  for (let i = 0; i < users.length; i++) {
    if (userAddress.toLowerCase() == users[i].toLowerCase()) {
      hasUser = true;
      break;
    }
  }

  if (!hasUser) {
    users.push(userAddress)
  }
  vault.users = users;
  vault.save()
}