import {numeric} from "runtime-compat/dyndef";

export {base} from "./int32.js";

const coercibles = {
  string: value => numeric(value) ? Number(value) : value,
  number: value => value,
  bigint: Number,
};

const coerce = value => coercibles[typeof value]?.(value) ?? value;

const range = (min, max) => value => value >= min && value <= max;

const integer = value => {
  const coerced = coerce(value);
  if (Number.isInteger(coerced)) {
    return coerced;
  }
  throw new Error(`${value} is not an integer`);
};

integer.range = (value, min, max) => {
  if (range(min, max)(value)) {
    return value;
  }
  throw new Error(`${value} is not in the range of ${min} of ${max}`);
};

export default integer;
