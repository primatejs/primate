import {bigint, range} from "./predicates/exports.js";
import {orthrow, not} from "./common/exports.js";

/* -(2n ** 64n / 2n) */
const min = -9_223_372_036_854_775_808n;
/* 2n ** 64n / 2n - 1n */
const max = 9_223_372_036_854_775_807n;

const i64range = range(min, max);

const name = "64-bit integer";

const i64 = value => orthrow(() => i64range(bigint(value)), not(name)(value));

export default i64;

export const base = "i64";
