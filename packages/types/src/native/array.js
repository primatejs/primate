export default {
  base: "array",
  type(value) {
    if (Array.isArray(value)) {
      return value;
    }
    throw new Error(`${value} is not an array`);
  },
};
