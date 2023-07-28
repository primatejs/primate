const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

const test = value => typeof value === "string" && valid.test(value);

const base = "string";

const email = {
  base,
  validate(value) {
    if (test(value)) {
      return value;
    }
    throw new Error("not a valid email");
  },
};

export default email;
