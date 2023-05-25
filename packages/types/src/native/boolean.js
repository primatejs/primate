import {boolish} from "runtime-compat/dyndef";

const coerce = value => boolish(value) ? value === "true" : value;

export default {
  base: "boolean",
  type(value) {
    const coerced = coerce(value);
    if (typeof coerced === "boolean") {
      return coerced;
    }
    throw new Error(`${value} is not a boolean`);
  },
};
