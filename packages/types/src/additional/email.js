const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

const test = value => typeof value === "string" && valid.test(value);

export default {
  base: "string",
  type(value) {
    if (test(value)) {
      return value;
    }
    throw new Error("not a valid email");
  },
};
