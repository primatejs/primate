import {int, range} from "./predicates/exports.js";
import {orthrow, not} from "./common/exports.js";

const min = 0;
/* 2 ** 8 - 1 */
const max = 255;

const u8range = range(min, max);

const name = "8-bit unsigned integer";

const u8 = value => orthrow(() => u8range(int(value)), not(name)(value));

u8.base = "u8";

export default u8;
