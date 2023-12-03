import { loadOrCreateLastHarvest } from './types/LastHarvest';
import { ProfitLogInReward } from '../generated/templates/StrategyListener/StrategyContract';
import { handlerLogic } from './debug/HandlerCalculator';

export function handleProfitLogInReward(event: ProfitLogInReward): void {
  handlerLogic(event.address.toHexString(), 'ProfitLogInReward', event.transaction, event.block);
  loadOrCreateLastHarvest(event.address, event.block, event.transaction);
}