import { Address, BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { UserBalance, UserBalanceHistory, UserTransaction, Vault } from "../../generated/schema";
import { VaultContract } from "../../generated/templates/VaultListener/VaultContract";
import { ERC20 } from "../../generated/Controller/ERC20";
import { pow } from "./Math";
import { BD_18, BD_ONE, BD_TEN, BD_ZERO, BI_18, FARM_TOKEN_MAINNET, FARM_TOKEN_MATIC, I_FARM_TOKEN } from "./Constant";

export function createUserBalance(vaultAddress: Address, amount: BigInt, beneficary: Address, tx: ethereum.Transaction, block: ethereum.Block, isDeposit: boolean): void {
  const vault = Vault.load(vaultAddress.toHex())
  if (vault != null) {
    const vaultContract = VaultContract.bind(vaultAddress)
    const sharePrice = vaultContract.getPricePerFullShare().divDecimal(pow(BD_TEN, vault.decimal.toI32()))
    let poolBalance = BigDecimal.zero()
    if (vault.pool != null) {
      const poolContract = ERC20.bind(Address.fromString(vault.pool!))
      poolBalance = poolContract.balanceOf(beneficary).divDecimal(pow(BD_TEN, vault.decimal.toI32())).times(sharePrice)
    }
    const vaultBalance = vaultContract.balanceOf(beneficary).divDecimal(pow(BD_TEN, vault.decimal.toI32())).times(sharePrice)
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

    // if (isDeposit) {
    //   userBalance.value = userBalance.value.plus(amount)
    // } else {
    //   const tempValue = userBalance.value.minus(amount)
    //
    //   userBalance.value = tempValue.lt(BigInt.zero())
    //     ? value
    //     : tempValue
    // }
    if (vault.id  == I_FARM_TOKEN.toHex()) {
      userBalance.additionalValues = [value, userBalance.additionalValues[1]]
      userBalance.value = value.plus(
        userBalance.additionalValues[1]
      )
    } else {
      userBalance.value = value
    }

    userBalance.save()
    const userBalanceHistory = new UserBalanceHistory(`${tx.hash.toHex()}-${beneficary.toHex()}`)
    userBalanceHistory.createAtBlock = block.number
    userBalanceHistory.timestamp = block.timestamp
    userBalanceHistory.userAddress = beneficary.toHex()
    userBalanceHistory.vault = vault.id
    userBalanceHistory.transactionType = isDeposit
      ? 'Deposit'
      : 'Withdraw'

    userBalanceHistory.additionalValues = userBalance.additionalValues
    userBalanceHistory.value = userBalance.value

    userBalanceHistory.sharePrice = vaultContract.getPricePerFullShare()
    userBalanceHistory.save()

    const userTransaction = new UserTransaction(tx.hash.toHex())
    userTransaction.createAtBlock = block.number
    userTransaction.timestamp = block.timestamp
    userTransaction.userAddress = beneficary.toHex()
    userTransaction.vault = vault.id
    userTransaction.transactionType = isDeposit
      ? 'Deposit'
      : 'Withdraw'
    userTransaction.sharePrice = vaultContract.getPricePerFullShare()
    userTransaction.value = amount
    userTransaction.save()
  }
}

// only for FARM token
export function createUserBalanceForFarm(amount: BigInt, beneficary: Address, tx: ethereum.Transaction, block: ethereum.Block, isDeposit: boolean): void {
  const vault = Vault.load(I_FARM_TOKEN.toHex())
  if (vault != null ) {
    const userBalanceId = `${vault.id}-${beneficary.toHex()}`
    const vaultContract = VaultContract.bind(FARM_TOKEN_MAINNET)
    const trySharePrice = vaultContract.try_getPricePerFullShare()
    const sharePrice = trySharePrice.reverted
      ? BI_18
      : trySharePrice.value
    const tryBalance = vaultContract.try_balanceOf(beneficary)
    const iFarmBalance = tryBalance.reverted
      ? BD_ZERO
      : tryBalance.value.divDecimal(BD_18).times(sharePrice.toBigDecimal())

    let userBalance = UserBalance.load(userBalanceId)
    if (userBalance == null) {
      userBalance = new UserBalance(userBalanceId)
      userBalance.createAtBlock = block.number
      userBalance.timestamp = block.timestamp
      userBalance.vault = vault.id
      userBalance.value = BigDecimal.zero()
      userBalance.additionalValues = [BigDecimal.zero(), BigDecimal.zero()]
      userBalance.userAddress = beneficary.toHex()
    }

    if (isDeposit) {
      const value = userBalance.value.plus(amount.divDecimal(BD_18))
      userBalance.additionalValues = [userBalance.additionalValues[0], value]
      userBalance.value = value.plus(userBalance.additionalValues[0])

    } else {
      const tempValue = userBalance.value.minus(amount.divDecimal(BD_18))
      const value = tempValue.lt(BigDecimal.zero())
        ? BigDecimal.zero()
        : tempValue
      userBalance.additionalValues = [userBalance.additionalValues[0], value]

      userBalance.value = value.plus(userBalance.additionalValues[0])

    }
    userBalance.save()

    const userBalanceHistory = new UserBalanceHistory(`${tx.hash.toHex()}-${beneficary.toHex()}`)
    userBalanceHistory.createAtBlock = block.number
    userBalanceHistory.timestamp = block.timestamp
    userBalanceHistory.userAddress = beneficary.toHex()
    userBalanceHistory.vault = vault.id
    userBalanceHistory.transactionType = isDeposit
      ? 'Deposit'
      : 'Withdraw'
    userBalanceHistory.value = userBalance.value
    userBalanceHistory.additionalValues = userBalance.additionalValues
    userBalanceHistory.sharePrice = sharePrice
    userBalanceHistory.save()

    const userTransaction = new UserTransaction(tx.hash.toHex())
    userTransaction.createAtBlock = block.number
    userTransaction.timestamp = block.timestamp
    userTransaction.userAddress = beneficary.toHex()
    userTransaction.vault = vault.id
    userTransaction.transactionType = isDeposit
      ? 'Deposit'
      : 'Withdraw'
    userTransaction.sharePrice = sharePrice
    userTransaction.value = amount
    userTransaction.save()
  }
}