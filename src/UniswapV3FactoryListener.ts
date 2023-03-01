import { CreatePoolCall, PoolCreated } from "../generated/UniswapV3Factory/UniswapV3FactoryContract";
import { UniswapV3Pool } from "../generated/schema";
import { loadOrCreateERC20Token } from "./types/Token";
import { createOrLoadUniswapPool } from "./types/UniswapPool";

export function handleCreatePool(call: CreatePoolCall): void {
  const tokenA = loadOrCreateERC20Token(call.inputs.tokenA)
  const tokenB = loadOrCreateERC20Token(call.inputs.tokenB)
  const fee = call.inputs.fee
  const pool = call.outputs.pool
  const id = `${tokenA.symbol.toLowerCase()}-${tokenB.symbol.toLowerCase()}-${fee}`

  const uniswapPool = createOrLoadUniswapPool(id, tokenA.id, tokenB.id, pool.toHex(), call.block);
}