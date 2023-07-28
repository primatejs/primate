import {boolish} from "runtime-compat/dyndef";

const coerce = value => boolish(value) ? value === "true" : value;

const base = "boolean";

const boolean = {
  base,
  validate(value) {
    const coerced = coerce(value);
    if (typeof coerced === "boolean") {
      return coerced;
    }
    throw new Error(`\`${value}\` is not a boolean`);
  },
};

export default boolean;
