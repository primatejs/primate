const valid = /^[^\W_]{8}-[^\W_]{4}-[^\W_]{4}-[^\W_]{4}-[^\W_]{12}$/u;

const test = value => typeof value === "string" && valid.test(value);

const base = "uuid";

const uuid = {
  base,
  validate(value) {
    if (test(value)) {
      return value;
    }
    throw new Error(`${value} is not a UUID`);
  },
};

export default uuid;
