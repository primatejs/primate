import {numeric} from "runtime-compat/dyndef";

const coercibles = {
  string: value => numeric(value) ? Number(value) : value,
  number: value => value,
  bigint: value => Number(value),
};

export const base = "float";

const number = value => {
  const coerced = coercibles[typeof value]?.(value) ?? value;
  if (typeof value === "number") {
    return coerced;
  }
  throw new Error(`${value} is not a number`);
};

export default number;
