import {int, range} from "./predicates/exports.js";
import {orthrow, not} from "./common/exports.js";

/* -(2 ** 16 / 2) */
const min = -32_768;
/* 2 ** 16 / 2 - 1 */
const max = 32_767;

const i16range = range(min, max);

const name = "16-bit integer";

const i16 = value => orthrow(() => i16range(int(value)), not(name)(value));

i16.base = "i16";

export default i16;
