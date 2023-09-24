import { int } from "./common.js";

const base = "i32";

const name = "32-bit integer";

// -(2 ** 32 / 2)
const min = -2_147_483_648;
// 2 ** 32 / 2 - 1
const max = 2_147_483_647;

export default int({ base, name, bounds: { min, max } });
