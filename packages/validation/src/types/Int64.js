const MIN = -9_223_372_036_854_775_808n;
const MAX = 9_223_372_036_854_775_807n;
const inRange = value => value >= MIN && value <= MAX;

const coerce = value => {
  try {
    return BigInt(value);
  } catch (_) {
    return value;
  }
};

const coercibles = {
  string: value => coerce(value),
  number: value => coerce(value),
  bigint: value => value,
};

export default {
  coerce: value => coercibles[typeof value]?.(value) ?? value,
  validate: value => typeof value === "bigint" && inRange(value),
  message: "Must be a valid 64-bit integer",
  base: "int64",
  builtin: BigInt,
};
