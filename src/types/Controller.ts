import { Address, ethereum, log } from "@graphprotocol/graph-ts";
import { Controller } from "../../generated/schema";
import { getGovernance, getStore } from "../utils/ControllerUtils";
import { ControllerListener } from "../../generated/templates";

export function loadOrCreateController(address: Address, block: ethereum.Block): Controller {
  let controller = Controller.load(address.toHexString())
  if (controller == null) {
    log.log(log.Level.INFO, `Create new controller: ${address}`)
    controller = new Controller(address.toHexString())
    controller.timestamp = block.timestamp
    controller.createAtBlock = block.number
    controller.store = getStore(address).toHex()
    controller.governance = getGovernance(address).toHex()
    controller.save()
    ControllerListener.create(address)
  }

  return controller
}