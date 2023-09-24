import { is, maybe } from "runtime-compat/invariant";

const base = "array";

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
    const validator = size ? array.sized(size) : array;

    return {
      validate(value) {
        const typed = validator.validate(value);

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
