import { Address, BigDecimal, BigInt, dataSource } from "@graphprotocol/graph-ts";
import { pow } from "./MathUtils";

export const UNKNOWN = 'unknown';

export const EXCLUSIVE_REWARD_POOL = Address.fromString('0x8f5adC58b32D4e5Ca02EAC0E293D35855999436C')
export const UNISWAP_V3_VALUE = pow(pow(BigDecimal.fromString('2'), 96), 2)
export const SECONDS_OF_YEAR = BigDecimal.fromString('31557600');
export const DEFAULT_DECIMAL = 18;
export const DEFAULT_PRICE = BigInt.fromI32(0);
export const YEAR_PERIOD = BigDecimal.fromString('365')
export const BI_TEN = BigInt.fromI64(10)
export const BI_18 = BigInt.fromString('1000000000000000000')
export const BD_18 = BigDecimal.fromString('1000000000000000000')
export const BD_ZERO = BigDecimal.fromString('0')
export const BD_ONE = BigDecimal.fromString('1')
export const BD_TEN = BigDecimal.fromString('10')
export const BD_ONE_HUNDRED = BigDecimal.fromString('100')

export const STABLE_COIN_ARRAY_MAINNET = [
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'.toLowerCase(),
  '0xe9e7cea3dedca5984780bafc599bd69add087d56'.toLowerCase(),
  '0xdAC17F958D2ee523a2206206994597C13D831ec7'.toLowerCase(),
  '0x0000000000085d4780B73119b644AE5ecd22b376'.toLowerCase(),
  '0x6B175474E89094C44Da98b954EedeAC495271d0F'.toLowerCase(),
]

export const STABLE_COIN_ARRAY_MATIC = [
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'.toLowerCase(),
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f'.toLowerCase(),
  '0xE840B73E5287865EEc17d250bFb1536704B43B21'.toLowerCase(),
  '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'.toLowerCase(),
]

export const PS_ADDRESSES_MAINNET = [
  '0x1571ed0bed4d987fe2b498ddbae7dfa19519f651'.toLowerCase(),
  '0xd3093e3efbe00f010e8f5efe3f1cb5d9b7fe0eb1'.toLowerCase(),
  '0x8f5adC58b32D4e5Ca02EAC0E293D35855999436C'.toLowerCase(),
  '0xa0246c9032bc3a600820415ae600c6388619a14d'.toLowerCase(),
  '0x25550Cccbd68533Fa04bFD3e3AC4D09f9e00Fc50'.toLowerCase(),
  '0x59258F4e15A5fC74A7284055A8094F58108dbD4f'.toLowerCase(),
]

export const PS_ADDRESSES_MATIC = [
  '0xab0b2ddb9c7e440fac8e140a89c0dbcbf2d7bbff'.toLowerCase(),
]

export const SKIP_APY_REWARD_MAINNET = [
  // FARMStead USDC-24
  '0xf6bd560131c1bb8591cf864cdd51817fd5657061'.toLowerCase(),
  // FARM/GRAIN
  '0xb9fa44b0911f6d777faab2fa9d8ef103f25ddf49'.toLowerCase()
]

export const VAULT_UNI_V3_CNG_WETH = '0xc3426599Ec933FbF657ee44b53e7f01d83Be1f63'.toLowerCase()
export const CNG = Address.fromString('0x5C1d9aA868a30795F92fAe903eDc9eFF269044bf')

export const LP_UNI_PAIR_CONTRACT_NAME = [
  '1inch'.toLowerCase(),
  'SushiSwap'.toLowerCase(),
  // only uniswap v2
  'Uniswap'.toLowerCase(),
  'Pancake'.toLowerCase(),
  'Kyber'.toLowerCase()
]
export const BALANCER_CONTRACT_NAME = 'Balancer'.toLowerCase()
export const CURVE_CONTRACT_NAME = 'Curve'.toLowerCase()
export const F_UNI_V3_CONTRACT_NAME = 'fUniV3'.toLowerCase()
export const NOTIONAL_CONTRACT_NAME = 'nToken'.toLowerCase()
export const I_FARM_NAME = 'iFARM'.toLowerCase()

export const UNISWAP_V3_FEES = [
  '3000',
  '5000',
  '8000',
  '10000'
]

export const BIG_APY_BD = BigDecimal.fromString('5000');



export const I_FARM_TOKEN = Address.fromString('0x1571ed0bed4d987fe2b498ddbae7dfa19519f651')
export const FARM_TOKEN_MAINNET = Address.fromString('0xa0246c9032bc3a600820415ae600c6388619a14d')
export const FARM_TOKEN_MATIC = Address.fromString('0xab0b2ddb9c7e440fac8e140a89c0dbcbf2d7bbff')

export const ORACLE_ADDRESS_MAINNET_FIRST = Address.fromString('0x48DC32eCA58106f06b41dE514F29780FFA59c279');
export const ORACLE_ADDRESS_MAINNET_SECOND = Address.fromString('0x1358c91D5b25D3eDAc2b7B26A619163d78f1717d');
export const ORACLE_ADDRESS_MATIC = Address.fromString('0x0E74303d0D18884Ce2CEb3670e72686645c4f38B');

export const NOTIONAL_ORACLE_ADDRESS = Address.fromString('0x65c816077C29b557BEE980ae3cC2dCE80204A0C5')
export const MEGA_FACTORY_ADDRESS = Address.fromString('0xe1ec9151eb8d9a3451b8f623ce8b62632a6d4f4d')

export const NULL_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000');

export function isStableCoin(address: string): boolean {
  if (dataSource.network() == 'mainnet') {
    return STABLE_COIN_ARRAY_MAINNET.join(' ').includes(address) == true
  } else if (dataSource.network() == 'matic') {
    return STABLE_COIN_ARRAY_MATIC.join(' ').includes(address) == true
  }
  return false
}

export function isPsAddress(address: string): boolean {
  if (dataSource.network() == 'mainnet') {
    return PS_ADDRESSES_MAINNET.join(' ').includes(address) == true
  } else if (dataSource.network() == 'matic') {
    return PS_ADDRESSES_MATIC.join(' ').includes(address) == true
  }
  return false
}

export function getOracleAddress(block: number): Address {
  if (dataSource.network() == 'mainnet') {
    if (block >= 12820106) {
      return ORACLE_ADDRESS_MAINNET_SECOND
    } else if (block >= 12015724) {
      return ORACLE_ADDRESS_MAINNET_FIRST
    }
  } else if (dataSource.network() == 'matic') {
    if (block >= 16841617) {
      return ORACLE_ADDRESS_MATIC
    }
  }

  return NULL_ADDRESS
}

export function getFarmToken(): Address {
  if (dataSource.network() == 'mainnet') {
    return FARM_TOKEN_MAINNET
  }
  if (dataSource.network() == 'matic') {
    return FARM_TOKEN_MATIC
  }
  return NULL_ADDRESS
}

export function skipCalculateApyReward(address: string): boolean {
  if (dataSource.network() == 'mainnet') {
    return SKIP_APY_REWARD_MAINNET.join(' ').includes(address) == true
  }
  return false
}
