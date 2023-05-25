export default {
  base: "datetime",
  type(value) {
    if (value instanceof Date) {
      return value;
    }
    throw new Error(`${value} is not a Date`);
  },
};
