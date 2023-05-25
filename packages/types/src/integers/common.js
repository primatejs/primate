import * as predicates from "../predicates/exports.js";
import {orthrow, not} from "../common/exports.js";

const int = ({base, min, max, name}) => {
  const inrange = predicates.range(min, max);
  return {
    base,
    type(value) {
      return orthrow(() => inrange(predicates.int(value)), not(name)(value));
    },
  };
};

const bigint = ({base, min, max, name}) => {
  const inrange = predicates.range(min, max);
  return {
    base,
    type(value) {
      return orthrow(() => inrange(predicates.bigint(value)), not(name)(value));
    },
  };
};

export {bigint, int};
