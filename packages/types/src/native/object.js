import {map} from "runtime-compat/object";
const fake = value => Array.isArray(value) || value === null;

const base = "embedded";

const object = {
  base,
  type(value) {
    if (typeof value === "object" && !fake(value)) {
      return value;
    }
    throw new Error(`\`${value}\` is not an object`);
  },
  of(schema) {
    return {
      type(subobject) {
        object.type(subobject);
        return map(subobject, ([key, value]) => [key, schema[key].type(value)]);
      },
      base,
    };
  },
};

export default object;
