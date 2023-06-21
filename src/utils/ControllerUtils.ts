import { Address } from "@graphprotocol/graph-ts";
import { ControllerContract } from '../../generated/Storage/ControllerContract';

export function getStore(address: Address): Address {
  const controller = ControllerContract.bind(address)
  const tryStore = controller.try_store()
  return tryStore.reverted ? Address.zero() : tryStore.value
}

export function getGovernance(address: Address): Address {
  const controller = ControllerContract.bind(address)
  const tryGovernance = controller.try_governance()
  return tryGovernance.reverted ? Address.zero() : tryGovernance.value
}