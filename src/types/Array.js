import InstanceType from "./Instance.js";
import errors from "./errors/Array.json" assert {type: "json"};

export default class ArrayType extends InstanceType {
  static instance = Array;
  static errors = errors;

  static is(value) {
    return value instanceof this.instance;
  }

  static length(value, length) {
    return value.length === Number(length);
  }

  static min(value, minimum) {
    return value.length >= Number(minimum);
  }

  static max(value, maximum) {
    return value.length <= Number(maximum);
  }

  static between({length}, minimum, maximum) {
    return length >= Number(minimum) && length <= Number(maximum);
  }
}
