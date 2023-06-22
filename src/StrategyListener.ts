import { loadOrCreateLastHarvest } from './types/LastHarvest';
import { ProfitLogInReward } from '../generated/templates/StrategyListener/StrategyContract';

export function handleProfitLogInReward(event: ProfitLogInReward): void {
  loadOrCreateLastHarvest(event.address, event.block, event.transaction);
}