import {numeric} from "runtime-compat/dyndef";

const MIN = -2_147_483_648;
const MAX = 2_147_483_647;

const inRange = value => value >= MIN && value <= MAX;

const coercibles = {
  string: value => numeric(value) ? Number(value) : value,
  number: value => value,
  bigint: value => Number(value),
};

export default {
  coerce: value => coercibles[typeof value]?.(value) ?? value,
  validate: value => Number.isInteger(value) && inRange(value),
  message: "Must be a valid 32-bit integer",
  base: "int32",
};
