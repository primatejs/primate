const valid = /^[a-z\d]{8}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{12}$/iu;

const uuid = value => {
  if (typeof value === "string" && valid.test(value)) {
    return value;
  }
  throw new Error(`${value} is not a UUID`);
};

uuid.type = "uuid";

export default uuid;
