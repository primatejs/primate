import {int, range} from "./predicates/exports.js";
import {orthrow, not} from "./common/exports.js";

/* -(2 ** 32 / 2) */
const min = -2_147_483_648;
/* 2 ** 32 / 2 - 1 */
const max = 2_147_483_647;

const i32range = range(min, max);

const name = "32-bit integer";

const i32 = value => orthrow(() => i32range(int(value)), not(name)(value));

export default i32;

export const base = "i32";
