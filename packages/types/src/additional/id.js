import {is} from "runtime-compat/dyndef";

export default {
  base: "primary",
  type(value, driver) {
    is(driver?.types.primary).defined("types.id :: driver missing primary key");

    return driver.types.primary.validate(value);
  },
};
