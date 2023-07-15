export default {
  base: "string",
  type(value) {
    if (typeof value === "string") {
      return value;
    }
    throw new Error(`\`${value}\` is not a string`);
  },
};
