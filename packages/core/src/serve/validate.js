import is from "@rcompat/invariant/is";
import maybe from "@rcompat/invariant/maybe";

export default (type, value, name) => {
  maybe(type.validate).function();
  if (type.validate) {
    return type.validate(value, name);
  }
  is(type).function();
  return type(value, name);
};
