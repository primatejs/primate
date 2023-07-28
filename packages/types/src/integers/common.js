import {assert} from "runtime-compat/dyndef";
import * as predicates from "../predicates/exports.js";
import {orthrow, not} from "../common/exports.js";

const int = ({base, bounds, name}) => {
  const inrange = predicates.range(bounds.min, bounds.max);
  return {
    base,
    validate(value) {
      return orthrow(() => inrange(predicates.int(value)), not(name)(value));
    },
    range(min, max) {
      assert(min < bounds.min || max > bounds.max,
        `range ${min}-${max} not within safe ${name} range`);
      const customRange = predicates.range(min, max);
      return {
        validate(value) {
          // throws
          return customRange(int.validate(value));
        },
        base,
      };
    },
  };
};

const bigint = ({base, bounds, name}) => {
  const inrange = predicates.range(bounds.min, bounds.max);
  return {
    base,
    validate(value) {
      return orthrow(() => inrange(predicates.bigint(value)), not(name)(value));
    },
    range(min, max) {
      assert(min < bounds.min || max > bounds.max,
        `range ${min}-${max} not within safe ${name} range`);
      const customRange = predicates.range(min, max);
      return {
        validate(value) {
          // throws
          return customRange(int.validate(value));
        },
        base,
      };
    },
  };
};

export {bigint, int};
