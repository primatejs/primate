const object = value => {
  if (typeof value === "object" && value !== null) {
    return value;
  }
  throw new Error(`${value} is not an object`);
};

object.base = "composite";

export default object;
