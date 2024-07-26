import int from "@primate/types/base/int";

const base = "i8";

const name = "8-bit integer";

// -(2 ** 8 / 2)
const min = -128;
// 2 ** 8 / 2 - 1
const max = 127;

export default int({ base, name, bounds: { min, max } });
