import { is } from "rcompat/invariant";

const error = "types.primary :: driver missing primary key";

export default {
  base: "primary",
  validate(value, types) {
    is(types.primary).defined(error);

    // generate primary values if not given
    if (value === undefined) {
      return;
    }

    return types.primary.validate(value);
  },
};
