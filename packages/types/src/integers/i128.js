import {bigint} from "./common.js";

const base = "i128";

const name = "128-bit integer";

// -(2n ** 128n / 2n)
const min = -170_141_183_460_469_231_731_687_303_715_884_105_728n;
// 2n ** 128n / 2n - 1n
const max = 170_141_183_460_469_231_731_687_303_715_884_105_727n;

export default bigint({base, name, bounds: {min, max}});
