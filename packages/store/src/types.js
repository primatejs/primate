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
  [JSON]: {
    validate: value => {
      try {
        JSON.stringify(value);
        return true;
      } catch (_) {
        return false;
      }
    },
    base: "json",
  },
  [BigInt]: {
    validate: value => typeof value === "bigint",
    coerce: value => {
      try {
        return BigInt(value);
      } catch (_) {
        return value;
      }
    },
    base: "bigint",
  },
};
