import assert from "@rcompat/invariant/assert";
import every from "@rcompat/invariant/every";
import is from "@rcompat/invariant/is";

const between = ({ length }, min, max) => length >= min && length <= max;
const base = "string";

const string = {
  base,
  validate(value) {
    if (typeof value === "string") {
      return value;
    }
    throw new Error("not a string");
  },
  length(length) {
    is(length).usize();

    return {
      validate(value) {
        const typed = string.validate(value);
        if (typed.length === length) {
          return typed;
        }
        throw new Error(`length does not equal ${length}`);
      },
      base,
    };
  },
  between(min, max) {
    every(min, max).usize();
    assert(min >= max, "min has to be smaller than max");

    return {
      validate(value) {
        const typed = string.validate(value);
        if (between(typed, min, max)) {
          return typed;
        }
        throw new Error(`not in the range ${min} - ${max}`);
      },
      base,
    };
  },
  toString() {
    return "string (runtime)";
  },
};

export default string;
