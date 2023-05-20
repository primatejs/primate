import {bigint, range} from "./predicates/exports.js";
import {orthrow, not} from "./common/exports.js";

/* -(2n ** 128n / 2n) */
const min = -170_141_183_460_469_231_731_687_303_715_884_105_728n;
/* 2n ** 128n / 2n - 1n */
const max = 170_141_183_460_469_231_731_687_303_715_884_105_727n;

const i128range = range(min, max);

const name = "128-bit integer";

const i128 = value => orthrow(() => i128range(bigint(value)), not(name)(value));

i128.base = "i128";

export default i128;
