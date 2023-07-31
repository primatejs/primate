import {is, maybe} from "runtime-compat/dyndef";

const base = "array";

const types = ["string", "number", "boolean"];

const array = {
  base,
  validate(value) {
    if (Array.isArray(value)) {
      return value;
    }
    throw new Error(`\`${value}\` is not an array`);
  },
  sized(size) {
    is(size).usize();

    return {
      validate(value) {
        const typed = array.validate(value);
        if (typed.length === size) {
          return typed;
        }
        throw new Error(`array is not of size ${size}`);
      },
      base,
    };
  },
  of(type, size) {
    maybe(size).usize();

    // condition strict-guarded by maybe
    const sized = value => size ? array.sized(size) : array.validate(value);

    return {
      validate(value) {
        const typed = sized(value);

        try {
          return typed.map(item => type.validate(item));
        } catch (_) {
          throw new Error(`array is not composed of only ${type}`);
        }
      },
      base,
    };
  },
};

export default array;
