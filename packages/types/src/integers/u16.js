import {int} from "./common.js";

const base = "u16";

const name = "16-bit unsigned integer";

const min = 0;
// 2 ** 16 - 1
const max = 65_535;

export default int({base, name, bounds: {min, max}});
