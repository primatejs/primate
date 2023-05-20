import {is} from "runtime-compat/dyndef";

export const base = "primary";

const id = (value, driver) => {
  is(driver?.types.primary).defined();

  return driver.types.primary.validate(value);
};

id.base = "primary";

export default id;
