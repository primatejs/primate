import {boolish, numeric} from "runtime-compat/dyndef";

export default {
  [String]: {
    validate: value => typeof value === "string",
    message: "Must be a valid string",
  },
  [Number]: {
    coerce: value => numeric(value) ? Number(value) : value,
    validate: value => typeof value === "number",
    message: "Must be a valid number",
  },
  [Boolean]: {
    coerce: value => boolish(value) ? value === "true" : value,
    validate: value => typeof value === "boolean",
    message: "Must be true or false",
  },
  [Date]: {
    validate: value => value instanceof Date,
    message: "Must be a valid date",
  },
};
