import {int, range} from "./predicates/exports.js";
import {orthrow, not} from "./common/exports.js";

const min = 0;
/* 2 ** 32 - 1 */
const max = 4_294_967_295;

const u32range = range(min, max);

const name = "32-bit unsigned integer";

const u32 = value => orthrow(() => u32range(int(value)), not(name)(value));

u32.base = "u32";

export default u32;

