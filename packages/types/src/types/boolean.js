import {boolish} from "runtime-compat/dyndef";

export const type = "boolean";

const boolean = value => {
  const coerced = boolish(value) ? value === "true" : value;
  if (typeof coerced === "boolean") {
    return coerced;
  }
  throw new Error(`${value} is not a boolean`);
};

export default boolean;
