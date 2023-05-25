import {bigint} from "./common.js";

const base = "u64";

const name = "64-bit unsigned integer";

const min = 0n;
/* 2n ** 64n - 1n */
const max = 18_446_744_073_709_551_615n;

export default bigint({base, name, min, max});
