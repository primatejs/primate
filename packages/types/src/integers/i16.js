import {int} from "./common.js";

const base = "i16";

const name = "16-bit integer";

// -(2 ** 16 / 2)
const min = -32_768;
// 2 ** 16 / 2 - 1
const max = 32_767;

export default int({base, name, bounds: {min, max}});
