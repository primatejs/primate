import {assert, numeric} from "runtime-compat/dyndef";
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

const nrange = range(bounds.min, bounds.max);

const coerce = value => coercibles[typeof value]?.(value) ?? value;

const base = "f64";

const number = {
  base,
  validate(value) {
    const coerced = coerce(value);
    if (typeof coerced === "number" && nrange(coerced)) {
      return coerced;
    }
    throw new Error(`\`${value}\` is not a number`);
  },
  range(min, max) {
    assert(min < bounds.min || max > bounds.max,
      `range ${min}-${max} not within safe integer range`);

    const customRange = range(min, max);
    return {
      validate(value) {
        // throws
        return customRange(number.validate(value));
      },
      base,
    };
  },
};

export default number;
