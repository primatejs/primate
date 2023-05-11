import {boolish} from "runtime-compat/dyndef";

export default {
  coerce: value => boolish(value) ? value === "true" : value,
  validate: value => typeof value === "boolean",
  message: "Must be true or false",
  type: "boolean",
};
