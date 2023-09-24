import { bigint } from "./common.js";

const base = "u128";

const name = "128-bit unsigned integer";

const min = 0n;
// 2n ** 128n - 1n
const max = 340_282_366_920_938_463_463_374_607_431_768_211_455n;

export default bigint({ base, name, bounds: { min, max } });
