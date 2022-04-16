import InstanceType from "./Instance.js";
import errors from "./errors/Array.json" assert {"type": "json"};

export default class ArrayType extends InstanceType {
  static get instance() {
    return Array;
  }

  static get errors() {
    return errors;
  }

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

  static between(value, minimum, maximum) {
    const length = value.length;
    return length >= Number(minimum) && length <= Number(maximum);
  }
}
