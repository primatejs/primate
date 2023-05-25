import {is} from "runtime-compat/dyndef";

export default {
  base: "primary",
  type(value, driver) {
    is(driver?.types.primary).defined();

    return driver.types.primary.validate(value);
  },
};
