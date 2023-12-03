import { Address, BigDecimal, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { Vault } from "../../generated/schema";
import { fetchContractDecimal, fetchContractName, fetchContractSymbol } from "../utils/ERC20Utils";
import { loadOrCreateERC20Token } from "./Token";
import { IFarmVaultListener, UniswapV3VaultListener, VaultListener } from "../../generated/templates";
import { fetchUnderlyingAddress } from "../utils/VaultUtils";
import { isIFarm, isUniswapV3 } from "../utils/PlatformUtils";
import { pushVault } from './TotalTvlUtils';

export function loadOrCreateVault(vaultAddress: Address, block: ethereum.Block, strategy: string = 'unknown'): Vault {
  let vault = Vault.load(vaultAddress.toHex())
  if (vault == null) {
    log.log(log.Level.INFO, `Create new vault: ${vaultAddress}`)
    vault = new Vault(vaultAddress.toHex());
    vault.name = fetchContractName(vaultAddress)
    vault.decimal = fetchContractDecimal(vaultAddress)
    vault.symbol = fetchContractSymbol(vaultAddress)
    const underlying = fetchUnderlyingAddress(vaultAddress)
    vault.createAtBlock = block.number;
    vault.strategy = strategy
    vault.timestamp = block.timestamp;
    vault.underlying = loadOrCreateERC20Token(underlying).id
    vault.lastShareTimestamp = BigInt.zero()
    vault.lastSharePrice = BigInt.zero()
    vault.apyAutoCompound = BigDecimal.zero()
    vault.apyAutoCompoundCount = BigInt.zero()
    vault.apyReward = BigDecimal.zero()
    vault.apyRewardCount = BigInt.zero()
    vault.priceUnderlying = BigDecimal.zero()
    vault.apy = BigDecimal.zero()
    vault.skipFirstApyReward = true
    if (isUniswapV3(vault.name)) {
      vault.isUniswapV3 = true
      UniswapV3VaultListener.create(vaultAddress)
    } else {
      vault.isUniswapV3 = false
      VaultListener.create(vaultAddress)
    }
    if (isIFarm(vault.name)) {
      vault.isIFarm = true
      IFarmVaultListener.create(vaultAddress)
    } else {
      vault.isIFarm = false
    }
    vault.tvl = BigDecimal.zero()
    vault.users = [];
    vault.lastUsersShareTimestamp = BigInt.zero();
    vault.save();
    pushVault(vault.id, block)
  }

  return vault;
}