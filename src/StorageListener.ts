import { SetControllerCall } from "../generated/Storage/StorageContract";
import { loadOrCreateController } from "./types/Controller";

export function handleSetController(call: SetControllerCall): void {
  const controller = loadOrCreateController(call.inputs._controller, call.block)
}