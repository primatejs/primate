import int from "./int.js";

const bigint = value => {
  try {
    return BigInt(value);
  } catch (_) {
    return value;
  }
};

const coercibles = {
  string: value => {
    let coerced;
    try {
      const i = int(value);
      coerced = i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER
        ? value
        : i;
    } catch (_) {
      coerced = value;
    }
    return bigint(coerced);
  },
  number: bigint,
  bigint,
};

const coerce = value => coercibles[typeof value]?.(value) ?? value;

const biginteger = value => {
  const coerced = coerce(value);
  if (typeof coerced === "bigint") {
    return coerced;
  }
  throw new Error(`${value} is not a big integer`);
};

export default biginteger;
