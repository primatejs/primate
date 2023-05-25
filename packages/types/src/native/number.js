import {numeric} from "runtime-compat/dyndef";
import {range} from "../predicates/exports.js";

const coercibles = {
  string: value => numeric(value) ? Number(value) : value,
  number: value => value,
  bigint: value => Number(value),
};

const bounds = {
  min: Number.MIN_SAFE_INTEGER,
  max: Number.MAX_SAFE_INTEGER,
};

const ntype = value => typeof value === "number";
const nrange = range(bounds.min, bounds.max);

const coerce = value => coercibles[typeof value]?.(value) ?? value;

const number = value => {
  const coerced = coerce(value);
  if (typeof coerced === "number" && nrange(coerced)) {
    return coerced;
  }
  throw new Error(`${value} is not a number`);
};

number.range = (min, max) => {
  if (min < bounds.min || max > bounds.max) {
    throw new Error(`number range ${min}-${max} not within safe integer range`);
  }
  return value => {
    const customRange = range(min, max);
    const coerced = coerce(value);
    if (typeof coerced === "number" && customRange(coerced)) {
      return value;
    }
    throw new Error(`${value} is not in the range of ${min} of ${max}`);
  };
};

number.base = "f64";

export default number;
