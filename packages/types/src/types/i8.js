import {int, range} from "./predicates/exports.js";
import {orthrow, not} from "./common/exports.js";

/* -(2 ** 8 / 2) */
const min = -128;
/* 2 ** 8 / 2 - 1 */
const max = 127;

const i8range = range(min, max);

const name = "8-bit integer";

const i8 = value => orthrow(() => i8range(int(value)), not(name)(value));

export default i8;

export const base = "i8";
