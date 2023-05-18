import {bigint, range} from "./predicates/exports.js";
import {orthrow, not} from "./common/exports.js";

const min = 0n;
/* 2n ** 64n - 1n */
const max = 18_446_744_073_709_551_615n;

const u64range = range(min, max);

const name = "64-bit unsigned integer";

const u64 = value => orthrow(() => u64range(bigint(value)), not(name)(value));

export default u64;

export const base = "u64";
