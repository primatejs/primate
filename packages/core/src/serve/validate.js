import { is, maybe } from "rcompat/invariant";

export default (type, value, name) => {
  maybe(type.validate).function();
  if (type.validate) {
    return type.validate(value, name);
  }
  is(type).function();
  return type(value, name);
};
