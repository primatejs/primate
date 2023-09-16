import {is} from "runtime-compat/dyndef";

const error = "types.primary :: driver missing primary key";

export default {
  base: "primary",
  validate(value, types) {
    is(types.primary).defined(error);

    return types.primary.validate(value);
  },
};
