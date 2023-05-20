export const base = "datetime";

const date = value => {
  if (value instanceof Date) {
    return value;
  }
  throw new Error(`${value} is not a Date`);
};

date.base = "datetime";

export default date;
