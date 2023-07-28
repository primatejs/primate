import {is, maybe} from "runtime-compat/dyndef";

export default (type, value, name) => {
  maybe(type.validate).function();
  if (type.validate) {
    return type.validate(value, name);
  }
  is(type).function();
  return type(value, name);
};
