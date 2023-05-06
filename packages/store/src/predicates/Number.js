import {numeric} from "runtime-compat/dyndef";

export default {
  coerce: value => numeric(value) ? Number(value) : value,
  validate: value => typeof value === "number",
  message: "Must be a valid number",
  base: "float",
};
