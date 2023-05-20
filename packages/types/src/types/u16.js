import {int, range} from "./predicates/exports.js";
import {orthrow, not} from "./common/exports.js";

const min = 0;
/* 2 ** 16 - 1 */
const max = 65_535;

const u16range = range(min, max);

const name = "16-bit unsigned integer";

const u16 = value => orthrow(() => u16range(int(value)), not(name)(value));

u16.base = "u16";

export default u16;
