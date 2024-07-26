import not from "@primate/types/base/not";
import orthrow from "@primate/types/base/orthrow";
import range from "@primate/types/predicates/range";
import { assert } from "rcompat/invariant";

const baseint = inttype => ({ base, bounds, name }) => {
  const inrange = range(bounds.min, bounds.max);
  return {
    base,
    validate(value) {
      return orthrow(() => inrange(inttype(value)), not(name)(value));
    },
    range(min, max) {
      assert(min < bounds.min || max > bounds.max,
        `range ${min}-${max} not within safe ${name} range`);
      const custom_range = range(min, max);
      return {
        validate(value) {
          // throws
          return custom_range(baseint.validate(value));
        },
        base,
      };
    },
  };
};

export default baseint;
