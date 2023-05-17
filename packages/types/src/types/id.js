import {is} from "runtime-compat/dyndef";

export const type = "primary";

const id = (value, driver) => {
  is(driver?.types.primary).defined();

  const {primary} = driver.types.primary;

  if (primary.validate(value)) {
    return value;
  }
  throw new Error(primary.message(value));
};

export default id;
