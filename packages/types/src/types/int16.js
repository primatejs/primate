import integer from "./integer.js";

const min = -32_768;
const max = 32_767;

export const base = "int16";

const int16 = value => {
  try {
    return integer.range(integer(value), min, max);
  } catch (_) {
    throw new Error(`${value} is not a 16-bit integer`);
  }
};

export default int16;
