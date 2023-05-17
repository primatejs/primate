export const type = "datetime";

const date = value => {
  if (value instanceof Date) {
    return value;
  }
  throw new Error(`${value} is not a Date`);
};

export default date;
