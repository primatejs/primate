import integer from "./integer.js";

const min = -2_147_483_648;
const max = 2_147_483_647;

export const base = "int32";

const int32 = value => {
  try {
    return integer.range(integer(value), min, max);
  } catch (_) {
    throw new Error(`${value} is not a 32-bit integer`);
  }
};

export default int32;
