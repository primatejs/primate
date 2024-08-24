import int from "#predicates/int";

const to_double = string => {
  const [d, i] = string.split(".");

  return {
    d: int(d),
    i: int(i),
  };
};

const coercibles = {
  string: value => to_double(value),
  number: value => [Math.trunc(value), value - Math.trunc(value)],
  bigint: value => [Number(value), 0],
};

const coerce = value => coercibles[typeof value]?.(value) ?? (() => {
  throw new Error();
})();

export default value => {
  try {
    return coerce(value);
  } catch (_) {
    throw new Error(`${value} is not a double`);
  }
};
