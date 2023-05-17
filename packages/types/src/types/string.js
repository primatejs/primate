export const type = "string";

const string = value => {
  if (typeof value === "string") {
    return value;
  }
  throw new Error(`${value} is not a string`);
};

export default string;
