import {
  BALANCER_CONTRACT_NAME,
  CURVE_CONTRACT_NAME,
  F_UNI_V3_CONTRACT_NAME, I_FARM_NAME,
  LP_UNI_PAIR_CONTRACT_NAME, NOTIONAL_CONTRACT_NAME
} from "./Constant";
import { Address } from "@graphprotocol/graph-ts";
import { WeightedPool2TokensContract } from "../../generated/templates/VaultListener/WeightedPool2TokensContract";

export function isLpUniPair(name: string): boolean {
  for (let i=0;i<LP_UNI_PAIR_CONTRACT_NAME.length;i++) {
    if (name.toLowerCase().startsWith(LP_UNI_PAIR_CONTRACT_NAME[i])) {
      return true
    }
  }
  return false
}

export function isBalancer(name: string): boolean {
  return !!name.toLowerCase().startsWith(BALANCER_CONTRACT_NAME);
}

export function isBalancerContract(address: Address): boolean {
  return !WeightedPool2TokensContract.bind(address).try_getPoolId().reverted
}

export function isCurve(name: string): boolean {
  return !!name.toLowerCase().startsWith(CURVE_CONTRACT_NAME);
}

export function isUniswapV3(name: string): boolean {
  return !!name.toLowerCase().startsWith(F_UNI_V3_CONTRACT_NAME);

}

export function isNotional(name: string): boolean {
  return !!name.toLowerCase().startsWith(NOTIONAL_CONTRACT_NAME);

}

export function isIFarm(name: string): boolean {
  return !!name.toLowerCase().startsWith(I_FARM_NAME);

}