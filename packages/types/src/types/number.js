import {numeric} from "runtime-compat/dyndef";
import {range} from "./predicates/exports.js";

const min = Number.MIX_SAFE_INTEGER;
const max = Number.MAX_SAFE_INTEGER;

const coercibles = {
  string: value => numeric(value) ? Number(value) : value,
  number: value => value,
  bigint: value => Number(value),
};

export const base = "double";

const number = value => {
  const coerced = coercibles[typeof value]?.(value) ?? value;
  if (typeof coerced === "number" && range(coerced, min, max)) {
    return coerced;
  }
  throw new Error(`${value} is not a number`);
};

number.range = (value, min, max) => {
  const coerced = coercibles[typeof value]?.(value) ?? value;
  if (range(coerced, min, max)) {
    return value;
  }
  throw new Error(`${value} is not in the range of ${min} of ${max}`);
};

export default number;
