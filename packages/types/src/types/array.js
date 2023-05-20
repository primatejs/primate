const array = value => {
  if (Array.isArray(value)) {
    return value;
  }
  throw new Error(`${value} is not an array`);
};

array.base = "array";

export default array;
