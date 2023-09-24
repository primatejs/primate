import { int } from "./common.js";

const base = "u8";

const name = "8-bit unsigned integer";

const min = 0;
// 2 ** 8 - 1
const max = 255;

export default int({ base, name, bounds: { min, max } });
