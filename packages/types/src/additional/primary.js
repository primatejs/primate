import {is} from "runtime-compat/dyndef";

const error = "types.primary :: driver missing primary key";

export default {
  base: "primary",
  type(value, driver) {
    is(driver?.types.primary).defined(error);

    return driver.types.primary.validate(value);
  },
};
