import {
  assert,
  describe,
  test
} from "matchstick-as/assembly/index"
import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { calculateApr, calculateAprAutoCompound, calculateApy } from "../../src/utils/ApyUtils";
import { BD_18 } from "../../src/utils/Constant";


describe("Apy tests", () => {
  test("Calculate apr and apy for FARM_DAI", () => {
    const tvlUsd = BigDecimal.fromString('3300000')
    const period = BigDecimal.fromString('257579')
    const rewardUsdForPeriod = BigDecimal.fromString('13.241361268')

    const apr = calculateApr(period, rewardUsdForPeriod, tvlUsd)
    const apy = calculateApy(apr)
    log.log(log.Level.INFO, `apr = ${apr}`)
    log.log(log.Level.INFO, `apy = ${apy}`)
    assert.assertTrue(apr.equals(BigDecimal.fromString('0.04916003790905653305305450860795048')))
    assert.assertTrue(apy.equals(BigDecimal.fromString('0.0491720903141718389099913495953')))
  })

  test("Calculate apr and apy for FARM_USDC with new data", () => {
    const tvlUsd = BigDecimal.fromString('5650000')
    // 1667934107 - 1667676528
    const period = BigDecimal.fromString('257579')
    // FARM token price in usd
    const rewardTokenPrice = BigDecimal.fromString('40')
    const rewardRate = BigDecimal.fromString('249362268518')
    const rewardUsdForPeriod = rewardRate.div(BD_18).times(period).times(rewardTokenPrice)

    log.log(log.Level.INFO, `rewardUsdForPeriod = ${rewardUsdForPeriod}`)

    const apr = calculateApr(period, rewardUsdForPeriod, tvlUsd)
    const apy = calculateApy(apr)
    log.log(log.Level.INFO, `apr = ${apr}`)
    log.log(log.Level.INFO, `apy = ${apy}`)

    assert.assertTrue(apr.equals(BigDecimal.fromString('0.005571167946891070300884955752212391')))
    assert.assertTrue(apy.equals(BigDecimal.fromString('0.0055713227141340043795132327171')))
  })

  test("Calculate apy with apr", () => {
    const apr = BigDecimal.fromString('74.3')
    const apy = calculateApy(apr)
      log.log(log.Level.INFO, `apr = ${apr}`)
    log.log(log.Level.INFO, `apy = ${apy}`)
    assert.assertTrue(apy.equals(BigDecimal.fromString('110.0645741036129302244669591304885')))
  })

  test('Calculate autocompound apr', ()=> {
    const diffSharePrice = BigDecimal.fromString('1014987267072829321')
      .minus(BigDecimal.fromString('1014291243088230033'))
      .div(BD_18)

    const diffTimestamp = BigDecimal.fromString('1667147027').minus(BigDecimal.fromString('1665742271'))
    const apr = calculateAprAutoCompound(diffSharePrice, diffTimestamp)
    log.log(log.Level.INFO, `apr = ${apr}`)
    assert.assertTrue(apr.equals(BigDecimal.fromString('1.56360581456071310525101868224802')))
  })

  test('Calculate autocompound apr for weth', ()=> {
    const diffSharePrice = BigDecimal.fromString('0.00069602398')

    const diffTimestamp = BigDecimal.fromString('1404756')
    const apr = calculateAprAutoCompound(diffSharePrice, diffTimestamp)
    log.log(log.Level.INFO, `apr = ${apr}`)
    assert.assertTrue(apr.equals(BigDecimal.fromString('1.563605804228492350272929960790344')))
  })

  test('Calculate apy reward for fUniV3_ORC_WETH', ()=> {
    const tvlUsd = BigDecimal.fromString('1850000')
    const period = BigDecimal.fromString('86400')
    const rewardRate = BigDecimal.fromString('70377434163')
    const rewardTokenPrice = BigDecimal.fromString('18')
    // const rewardUsdForPeriod = rewardRate.div(BD_18).times(period).times(rewardTokenPrice)
    const rewardUsdForPeriod = BigDecimal.fromString('92')

    const apr = calculateApr(period, rewardUsdForPeriod, tvlUsd)
    const apy = calculateApy(apr)

    log.log(log.Level.INFO, `rewardUsdForPeriod = ${rewardUsdForPeriod}`)
    log.log(log.Level.INFO, `apr = ${apr}`)
    log.log(log.Level.INFO, `apy = ${apy}`)
    assert.assertTrue(apr.equals(BigDecimal.fromString('1.816378378378378378378378378378378')))
    assert.assertTrue(apy.equals(BigDecimal.fromString('1.832928841337900646854755835586')))
  })

  test('Calculate apy reward for fUniV3_ORC_WETH 2', ()=> {
    const tvlUsd = BigDecimal.fromString('969000')
    const period = BigDecimal.fromString('86400')
    const rewardRate = BigDecimal.fromString('67235408362')
    const rewardTokenPrice = BigDecimal.fromString('54')
    const rewardUsdForPeriod = rewardRate.div(BD_18).times(period).times(rewardTokenPrice)
    // const rewardUsdForPeriod = BigDecimal.fromString('92')

    const apr = calculateApr(period, rewardUsdForPeriod, tvlUsd)
    const apy = calculateApy(apr)

    log.log(log.Level.INFO, `rewardUsdForPeriod = ${rewardUsdForPeriod}`)
    log.log(log.Level.INFO, `apr = ${apr}`)
    log.log(log.Level.INFO, `apy = ${apy}`)
    assert.assertTrue(apr.equals(BigDecimal.fromString('0.01182420625778443393188854489164087')))
    assert.assertTrue(apy.equals(BigDecimal.fromString('0.0118249034291491860020857311177')))
  })

  test('Calculate autocompound apr for look', ()=> {
    const diffSharePrice = BigDecimal.fromString('0.01482913559')

    const diffTimestamp = BigDecimal.fromString('1270908')
    const apr = calculateAprAutoCompound(diffSharePrice, diffTimestamp)
    log.log(log.Level.INFO, `apr = ${apr}`)
    assert.assertTrue(apr.equals(BigDecimal.fromString('36.8218572308132453332577967878084')))
  })

  test('Calculate autocompound apr for look', ()=> {
    const diffSharePrice = BigDecimal.fromString('0.015676185')

    const diffTimestamp = BigDecimal.fromString('452364')
    const apr = calculateAprAutoCompound(diffSharePrice, diffTimestamp)
    log.log(log.Level.INFO, `apr = ${apr}`)
    assert.assertTrue(apr.equals(BigDecimal.fromString('109.3594485317133989442130673528398')))
  })

  test('Calculate apy reward for fUniV3_ORC_WETH 3', ()=> {
    const tvlUsd = BigDecimal.fromString('1700000')
    const period = BigDecimal.fromString('592392')
    // rewardRate for token
    const rewardRate = BigDecimal.fromString('89718915343915343')
    const rewardTokenPrice = BigDecimal.fromString('0.12')
    const rewardUsdForPeriod = rewardRate.div(BD_18).times(period).times(rewardTokenPrice)

    const apr = calculateApr(period, rewardUsdForPeriod, tvlUsd)
    const apy = calculateApy(apr)

    log.log(log.Level.INFO, `rewardUsdForPeriod = ${rewardUsdForPeriod}`)
    log.log(log.Level.INFO, `apr = ${apr}`)
    log.log(log.Level.INFO, `apy = ${apy}`)
    assert.assertTrue(apr.equals(BigDecimal.fromString('19.9857433613445376112244705882353')))
    assert.assertTrue(apy.equals(BigDecimal.fromString('22.1161844532205266959197802689959')))
  })

  test('Calculate apy reward for fUniV3_CNG_WETH', ()=> {
    const tvlUsd = BigDecimal.fromString('440000')
    const period = BigDecimal.fromString('592512')
    const rewardRate = BigDecimal.fromString('49843841857730746')
    const rewardTokenPrice = BigDecimal.fromString('0.059')
    const rewardUsdForPeriod = rewardRate.div(BD_18).times(period).times(rewardTokenPrice)
    // const rewardUsdForPeriod = BigDecimal.fromString('92')

    const apr = calculateApr(period, rewardUsdForPeriod, tvlUsd)
    const apy = calculateApy(apr)

    log.log(log.Level.INFO, `rewardUsdForPeriod = ${rewardUsdForPeriod}`)
    log.log(log.Level.INFO, `apr = ${apr}`)
    log.log(log.Level.INFO, `apy = ${apy}`)
    assert.assertTrue(apr.equals(BigDecimal.fromString('21.09185668290043263822872727272727')))
    assert.assertTrue(apy.equals(BigDecimal.fromString('23.4736577416503232053493577851685')))
  })
})