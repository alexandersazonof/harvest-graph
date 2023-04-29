import { SetControllerCall } from "../generated/Storage/StorageContract";
import { loadOrCreateController } from "./types/Controller";
import { ethereum } from '@graphprotocol/graph-ts';
import { createTotalTvl, getTvlUtils } from './types/TotalTvlUtils';
import { BI_EVERY_24_HOURS, EVERY_24_HOURS, MODULE_RESULT } from './utils/Constant';

export function handleSetController(call: SetControllerCall): void {
  const controller = loadOrCreateController(call.inputs._controller, call.block)
}

export function handleBlock(block: ethereum.Block): void {
  const tvlUtils = getTvlUtils(block)
  if (block.timestamp.toI32() % EVERY_24_HOURS == MODULE_RESULT) {
    createTotalTvl(block)
  } else if (block.timestamp.ge(tvlUtils.lastTimestampUpdate.plus(BI_EVERY_24_HOURS))) {
    createTotalTvl(block)
  }
}