import o from "rcompat/object";
const fake = value => Array.isArray(value) || value === null;

const base = "embedded";

const object = {
  base,
  validate(value) {
    if (typeof value === "object" && !fake(value)) {
      return value;
    }
    throw new Error(`\`${value}\` is not an object`);
  },
  of(schema) {
    return {
      validate(subobject) {
        const typed = object.validate(subobject);
        return o.map(typed, ([key, value]) =>
          [key, schema[key].validate(value)]);
      },
      base,
    };
  },
};

export default object;
