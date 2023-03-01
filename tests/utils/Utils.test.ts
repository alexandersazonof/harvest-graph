import { describe, test, assert } from "matchstick-as/assembly/index";
import { isPsAddress } from "../../src/utils/Constant";
import { isUniswapV3 } from "../../src/utils/PlatformUtils";

describe('Utils tests', () => {
  test('Is ps address', () => {
    const result = isPsAddress('0x1571ed0bed4d987fe2b498ddbae7dfa19519f651')
    assert.assertTrue(result)
  })
  test('Is ps uniswapV3', () => {
    const result = isUniswapV3('fUniV3_ORC_WETH')
    assert.assertTrue(result)
  })
})