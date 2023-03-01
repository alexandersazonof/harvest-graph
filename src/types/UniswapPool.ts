import { UniswapV3Pool } from "../../generated/schema";
import { ethereum } from "@graphprotocol/graph-ts";

export function createOrLoadUniswapPool(
  id: string,
  tokenA: string,
  tokenB: string,
  pool: string,
  block: ethereum.Block,
): UniswapV3Pool {
  let uniswapPool = UniswapV3Pool.load(id)
  if (uniswapPool == null) {
    uniswapPool = new UniswapV3Pool(id)
    uniswapPool.tokenA = tokenA
    uniswapPool.tokenB = tokenB
    uniswapPool.pool = pool
    uniswapPool.createAtBlock = block.number
    uniswapPool.timestamp = block.timestamp
    uniswapPool.save()
  }
  return uniswapPool;
}