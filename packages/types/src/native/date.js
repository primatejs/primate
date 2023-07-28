const base = "datetime";

const date = {
  base,
  validate(value) {
    if (value instanceof Date) {
      return value;
    }
    throw new Error(`${value} is not a Date`);
  },
};

export default date;
