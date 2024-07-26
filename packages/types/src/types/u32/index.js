import int from "@primate/types/base/int";

const base = "u32";

const name = "32-bit unsigned integer";

const min = 0;
// 2 ** 32 - 1
const max = 4_294_967_295;

export default int({ base, name, bounds: { min, max } });
