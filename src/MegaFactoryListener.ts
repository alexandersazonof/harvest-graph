import { DeploymentCompleted, MegaFactoryContract } from "../generated/MegaFactory/MegaFactoryContract";
import { loadOrCreateStrategy } from "./utils/Strategy";
import { loadOrCreateVault } from "./utils/Vault";
import { MEGA_FACTORY_ADDRESS } from "./utils/Constant";
import { loadOrCreatePotPool } from "./utils/PotPool";


export function handleDeploymentCompleted(event: DeploymentCompleted): void {
  const id = event.params.id
  const megaFactoryContract = MegaFactoryContract.bind(MEGA_FACTORY_ADDRESS)
  const tryCompletedDeployment = megaFactoryContract.try_completedDeployments(id)
  if (!tryCompletedDeployment.reverted) {
    const vaultAddress = tryCompletedDeployment.value.getNewVault()
    const strategyAddress = tryCompletedDeployment.value.getNewStrategy()
    const poolAddress = tryCompletedDeployment.value.getNewPool()
    const block = event.block;

    loadOrCreateStrategy(strategyAddress, block)
    loadOrCreateVault(vaultAddress, block, strategyAddress.toHex())
    loadOrCreatePotPool(poolAddress, block)
  }
}