import { numeric } from "rcompat/invariant";

const coercibles = {
  string: value => numeric(value) ? Number(value) : value,
  number: value => value,
  bigint: Number,
};

const coerce = value => coercibles[typeof value]?.(value) ?? value;

export default value => {
  const coerced = coerce(value);
  if (Number.isInteger(coerced)) {
    return coerced;
  }
  throw new Error(`${value} is not an integer`);
};
