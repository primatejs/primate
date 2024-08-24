import not from "#not";
import orthrow from "#orthrow";
import range from "#predicates/range";
import assert from "@rcompat/invariant/assert";

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
