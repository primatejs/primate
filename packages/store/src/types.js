import {boolish, numeric} from "runtime-compat/dyndef";

export default {
  [String]: {
    validate: value => typeof value === "string",
    message: "Must be a valid string",
    base: "string",
  },
  [Number]: {
    coerce: value => numeric(value) ? Number(value) : value,
    validate: value => typeof value === "number",
    message: "Must be a valid number",
    base: "float",
  },
  [Boolean]: {
    coerce: value => boolish(value) ? value === "true" : value,
    validate: value => typeof value === "boolean",
    message: "Must be true or false",
    base: "boolean",
  },
  [Date]: {
    validate: value => value instanceof Date,
    message: "Must be a valid date",
    base: "datetime",
  },
  [Array]: {
    validate: value => Array.isArray(value),
    message: "Must be a valid array",
    base: "array",
  },
  [Object]: {
    validate: value => typeof value === "object" && value !== null,
    message: "Must be a valid object",
    base: "composite",
  },
  [JSON]: {
    validate: value => {
      try {
        JSON.parse(value);
        return true;
      } catch (_) {
        return false;
      }
    },
    message: "Must be a valid JSON string",
    base: "json",
  },
};
