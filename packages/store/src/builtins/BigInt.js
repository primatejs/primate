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
  validate: value => typeof value === "bigint",
  message: "Must be a valid big integer",
  type: "bigint",
};
