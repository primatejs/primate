import {numeric} from "runtime-compat/dyndef";

const MIN = -32_768;
const MAX = 32_767;

const inRange = value => value >= MIN && value <= MAX;

const coercibles = {
  string: value => numeric(value) ? Number(value) : value,
  number: value => value,
  bigint: value => Number(value),
};

export default {
  coerce: value => coercibles[typeof value]?.(value) ?? value,
  validate: value => Number.isInteger(value) && inRange(value),
  message: "Must be a valid 16-bit integer",
  base: "int16",
};
