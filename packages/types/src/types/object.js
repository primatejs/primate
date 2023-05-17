export const type = "composite";

const object = value => {
  if (typeof value === "object" && value !== null) {
    return value;
  }
  throw new Error(`${value} is not an object`);
};

export default object;
