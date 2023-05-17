import {numeric} from "runtime-compat/dyndef";

const coercibles = {
  string: value => numeric(value) ? Number(value) : value,
  number: value => value,
  bigint: value => Number(value),
};

export default {
  coerce: value => coercibles[typeof value]?.(value) ?? value,
  validate: value => typeof value === "number",
  message: "Must be a valid number",
  type: "float",
};
