import integer from "./integer.js";

const min = -128;
const max = 127;

export const base = "int8";

const int8 = value => {
  try {
    return integer.range(integer(value), min, max);
  } catch (_) {
    throw new Error(`${value} is not a 8-bit integer`);
  }
};

export default int8;
