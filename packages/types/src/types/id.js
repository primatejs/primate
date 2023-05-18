import {is} from "runtime-compat/dyndef";

export const type = "primary";

const id = (value, driver) => {
  is(driver?.types.primary).defined();

  return driver.types.primary.validate(value);
};

export default id;
