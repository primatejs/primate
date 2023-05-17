const min = -9_223_372_036_854_775_808n;
const max = 9_223_372_036_854_775_807n;
const range = value => value >= min && value <= max;

const bigint = value => {
  try {
    return BigInt(value);
  } catch (_) {
    return value;
  }
};

export const base = "int64";

const coercibles = {
  string: bigint,
  number: bigint,
  bigint,
};

const coerce = value => coercibles[typeof value]?.(value) ?? value;

const int64 = value => {
  const coerced = coerce(value);
  if (typeof coerced === "bigint" && range(coerced)) {
    return coerced;
  }
  throw new Error(`${value} is not a 64-bit integer`);
};

export default int64;
