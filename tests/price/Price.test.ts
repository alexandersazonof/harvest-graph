import { describe, test, assert, createMockedFunction } from "matchstick-as/assembly/index";
import {
  getPriceForCurve,
  getPriceForUniswapV3
} from "../../src/utils/PriceUtils";
import { isCurve,
  isLpUniPair, isNotional,
  isUniswapV3} from "../../src/utils/PlatformUtils";
import { UniswapV3Pool, Vault } from "../../generated/schema";
import { Address, BigDecimal, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import {
  DEFAULT_DECIMAL,
  isPsAddress,
  NULL_ADDRESS,
  ORACLE_ADDRESS_MAINNET_FIRST,
  ORACLE_ADDRESS_MAINNET_SECOND
} from "../../src/utils/Constant";

describe('Get price for uniswapV3', () => {
  test('Price by UniV3_WBTC_WETH', () => {
    const vault = new Vault('ID')
    vault.name = 'name'
    vault.symbol = 'symbol'
    vault.decimal = BigInt.fromI32(18)
    vault.createAtBlock = BigInt.fromI32(1115002)
    vault.timestamp = BigInt.fromI32(12412424)
    vault.underlying = '1'
    vault.lastShareTimestamp = BigInt.fromI32(0)
    vault.lastSharePrice = BigInt.fromI32(0)
    const price = getPriceForUniswapV3(vault, 123)
    assert.assertTrue(price.equals(BigDecimal.zero()))
  })

  test('It is uniswapV3', () => {
    const result = isUniswapV3('fUniV3_USDC_WETH')
    assert.assertTrue(result)
  })

  test('It is PS address', () => {
    const result = isPsAddress('0x59258F4e15A5fC74A7284055A8094F58108dbD4f'.toLowerCase())
    assert.assertTrue(result)
  })

  test('It is lp', () => {
    const result = isLpUniPair('Uniswap V2')
    assert.assertTrue(result)
  })

  test('Get price for Curve contract', () => {
    // CRV:TriCrypto2
    const address = '0xc4AD29ba4B3c580e6D59105FFf484999997675Ff'
    const contractAddress = Address.fromString(address)
    const minterAddress = '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46'
    const minterContract = Address.fromString(minterAddress)

    createMockedFunction(contractAddress, 'minter', 'minter():(address)')
      .returns([ethereum.Value.fromAddress(minterContract)])

    createMockedFunction(contractAddress, 'totalSupply', 'totalSupply():(uint256)')
      .returns([ethereum.Value.fromSignedBigInt(BigInt.fromString('170072949681759705845857'))])


    createMockedFunction(minterContract, 'coins', 'coins(uint256):(address)')
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))])
      .returns([ethereum.Value.fromAddress(Address.fromString('0x0000000000000000000000000000000000000001'))])

    createMockedFunction(ORACLE_ADDRESS_MAINNET_SECOND, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(Address.fromString('0x0000000000000000000000000000000000000001'))])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI64(996884286937131371))])

    createMockedFunction(Address.fromString('0x0000000000000000000000000000000000000001'), 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(6))])

    createMockedFunction(minterContract, 'balances', 'balances(uint256):(uint256)')
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))])
      .returns([ethereum.Value.fromSignedBigInt(BigInt.fromI64(47861987269296))])



    createMockedFunction(minterContract, 'coins', 'coins(uint256):(address)')
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))])
      .returns([ethereum.Value.fromAddress(Address.fromString('0x0000000000000000000000000000000000000002'))])

    createMockedFunction(ORACLE_ADDRESS_MAINNET_SECOND, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(Address.fromString('0x0000000000000000000000000000000000000002'))])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('16733712573962761368931'))])

    createMockedFunction(Address.fromString('0x0000000000000000000000000000000000000002'), 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(8))])

    createMockedFunction(minterContract, 'balances', 'balances(uint256):(uint256)')
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))])
      .returns([ethereum.Value.fromSignedBigInt(BigInt.fromString('284051892186'))])



    createMockedFunction(minterContract, 'coins', 'coins(uint256):(address)')
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2))])
      .returns([ethereum.Value.fromAddress(Address.fromString('0x0000000000000000000000000000000000000003'))])

    createMockedFunction(ORACLE_ADDRESS_MAINNET_SECOND, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(Address.fromString('0x0000000000000000000000000000000000000003'))])
      .returns([ethereum.Value.fromSignedBigInt(BigInt.fromString('1214746799533196738459'))])

    createMockedFunction(Address.fromString('0x0000000000000000000000000000000000000003'), 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(18))])

    createMockedFunction(minterContract, 'balances', 'balances(uint256):(uint256)')
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2))])
      .returns([ethereum.Value.fromSignedBigInt(BigInt.fromString('39090772957888872553640'))])

    createMockedFunction(minterContract, 'coins', 'coins(uint256):(address)')
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(3))])
      .returns([ethereum.Value.fromAddress(Address.zero())])


    createMockedFunction(contractAddress, 'decimals', 'decimals():(uint256)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(18))])

    const block = 15996940
    const price = getPriceForCurve(address, block)
    log.log(log.Level.INFO, `price = ${price}`)
    assert.assertTrue(price.equals(BigDecimal.fromString('839.2321169157461488772447420326583')))
  })

  test('Price for UNISWAP 3 ORC-ETH' , () => {
    const uniswapPool = Address.fromString('0xd43b29aaf8ad938cff4f478a0756defffb329d07')
    const tokenA = Address.fromString('0x662b67d00a13faf93254714dd601f5ed49ef2f51')
    const tokenB = Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')

    const block = 999999999
    const vault = new Vault('')
    vault.symbol = 'fUniV3_ORC_WETH'

    const uniswaPoolEntity = new UniswapV3Pool('orc-weth-3000')
    uniswaPoolEntity.pool = uniswapPool.toHex()
    uniswaPoolEntity.tokenA = tokenA.toHex()
    uniswaPoolEntity.tokenB = tokenB.toHex()
    uniswaPoolEntity.createAtBlock = BigInt.fromString('7787878')
    uniswaPoolEntity.timestamp = BigInt.fromString('789798')
    uniswaPoolEntity.save()

    createMockedFunction(uniswapPool, 'liquidity', 'liquidity():(uint128)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('56213242337321632152637'))])

    createMockedFunction(uniswapPool, 'token0', 'token0():(address)')
      .returns([ethereum.Value.fromAddress(tokenA)])
    createMockedFunction(uniswapPool, 'token1', 'token1():(address)')
      .returns([ethereum.Value.fromAddress(tokenB)])

    createMockedFunction(tokenA, 'balanceOf', 'balanceOf(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(uniswapPool)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('6028141645171657933357644'))])
    createMockedFunction(tokenB, 'balanceOf', 'balanceOf(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(uniswapPool)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('441541530971877765189'))])

    createMockedFunction(tokenA, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('18'))])
    createMockedFunction(tokenB, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('18'))])

    createMockedFunction(ORACLE_ADDRESS_MAINNET_SECOND, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(tokenA)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('88708358802578239'))])
    createMockedFunction(ORACLE_ADDRESS_MAINNET_SECOND, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(tokenB)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1187522443081974814423'))])

    const result = getPriceForUniswapV3(vault, block)

    log.log(log.Level.INFO, `price = ${result}`)

    assert.assertTrue(result.equals(BigDecimal.fromString('18.84052556867676493497412934556159')))
  })

  test('Price for UNISWAP 3 USDC-ETH' , () => {
    const uniswapPool = Address.fromString('0xd43b29aaf8ad938cff4f478a0756defffb329d07')
    const tokenA = Address.fromString('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
    const tokenB = Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')

    const block = 999999999
    const vault = new Vault('')
    vault.symbol = 'fUniV3_ORC_WETH'

    const uniswaPoolEntity = new UniswapV3Pool('usdc-weth-3000')
    uniswaPoolEntity.pool = uniswapPool.toHex()
    uniswaPoolEntity.tokenA = tokenA.toHex()
    uniswaPoolEntity.tokenB = tokenB.toHex()
    uniswaPoolEntity.createAtBlock = BigInt.fromString('7787878')
    uniswaPoolEntity.timestamp = BigInt.fromString('789798')
    uniswaPoolEntity.save()

    createMockedFunction(uniswapPool, 'liquidity', 'liquidity():(uint128)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('11258396806167585893'))])

    createMockedFunction(uniswapPool, 'token0', 'token0():(address)')
      .returns([ethereum.Value.fromAddress(tokenA)])
    createMockedFunction(uniswapPool, 'token1', 'token1():(address)')
      .returns([ethereum.Value.fromAddress(tokenB)])

    createMockedFunction(tokenA, 'balanceOf', 'balanceOf(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(uniswapPool)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('79495975916788'))])
    createMockedFunction(tokenB, 'balanceOf', 'balanceOf(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(uniswapPool)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('49612046311124914631431'))])

    createMockedFunction(tokenA, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('6'))])
    createMockedFunction(tokenB, 'decimals', 'decimals():(uint8)')
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('18'))])

    createMockedFunction(ORACLE_ADDRESS_MAINNET_SECOND, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(tokenA)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1000000000000000000'))])
    createMockedFunction(ORACLE_ADDRESS_MAINNET_SECOND, 'getPrice', 'getPrice(address):(uint256)')
      .withArgs([ethereum.Value.fromAddress(tokenB)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1642728713999340305193'))])

    const result = getPriceForUniswapV3(vault, block)

    log.log(log.Level.INFO, `price = ${result}`)

    assert.assertTrue(result.equals(BigDecimal.fromString('14300003.0754060337310906886058827')))
  })

  test('Is it notional', () => {
    const result = isNotional('nToken Dai Stablecoin')
    assert.assertTrue(result)
  })


  test('It is curve', () => {
    let result = isCurve('Curve CRV-ETH')
    assert.assertTrue(result)
    result = isCurve('Curve.fi USDN/3Crv')
    assert.assertTrue(result)
  })
})