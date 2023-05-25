import {bigint} from "./common.js";

const base = "i64";

const name = "64-bit integer";

/* -(2n ** 64n / 2n) */
const min = -9_223_372_036_854_775_808n;
/* 2n ** 64n / 2n - 1n */
const max = 9_223_372_036_854_775_807n;

export default bigint({base, name, min, max});
