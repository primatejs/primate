const valid = /^[^\W_]{8}-[^\W_]{4}-[^\W_]{4}-[^\W_]{4}-[^\W_]{12}$/u;

const test = value => typeof value === "string" && valid.test(value);

export default {
  base: "uuid",
  type(value) {
    if (test(value)) {
      return value;
    }
    throw new Error(`${value} is not a UUID`);
  },
};
