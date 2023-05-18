import {bigint, range} from "./predicates/exports.js";
import {orthrow, not} from "./common/exports.js";

const min = 0n;
/* 2n ** 128n - 1n */
const max = 340_282_366_920_938_463_463_374_607_431_768_211_455n;

const u128range = range(min, max);

const name = "128-bit unsigned integer";

const u128 = value => orthrow(() => u128range(bigint(value)), not(name)(value));

export default u128;

export const base = "u128";
