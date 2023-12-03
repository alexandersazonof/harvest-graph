import { HandlerCalculator, HandlerCalculatroHistory } from '../../generated/schema';
import { BigInt, ethereum } from '@graphprotocol/graph-ts';

export function getOrCreateHandlerCalculator(address: string): HandlerCalculator {
  let handler = HandlerCalculator.load(address);
  if (!handler) {
    handler = new HandlerCalculator(address);
    handler.count = BigInt.fromString('0')
    handler.save()
  }

  return handler;
}

export function createHandlerCalculatorHistory(handler: HandlerCalculator, name: string, tx: ethereum.Transaction, block: ethereum.Block): void {
  const id = `${handler.id}-${tx.hash.toHexString()}`;
  let history = HandlerCalculatroHistory.load(id)
  if (!history) {
    history = new HandlerCalculatroHistory(id);
    history.name = name;
    history.handler = handler.id
    history.timestamp = block.timestamp
    history.save()
  }
}

export function handlerLogic(address: string, name: string, tx: ethereum.Transaction, block: ethereum.Block): void {
  const handler = getOrCreateHandlerCalculator(address);
  handler.count = handler.count.plus(BigInt.fromString('1'));
  handler.save()

  createHandlerCalculatorHistory(handler, name, tx, block);
}