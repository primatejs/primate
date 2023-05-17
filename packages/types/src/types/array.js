export const base = "array";

const array = value => {
  if (Array.isArray(value)) {
    return value;
  }
  throw new Error(`${value} is not an array`);
};

export default array;
