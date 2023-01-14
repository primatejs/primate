import PrimitiveType from "./Primitive.js";
import errors from "./errors/String.json" assert {type: "json"};

export default class StringType extends PrimitiveType {
  static type = "string";
  static instance = String;
  static errors = errors;

  static coerce(value) {
    return value?.trim() === "" ? undefined : super.coerce(value);
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

  static lowercase(value) {
    return value === value.toLowerCase();
  }

  static uppercase(value) {
    return value === value.toUpperCase();
  }

  static alphanumeric(value) {
    return /^[a-z0-9]+$/iu.test(value);
  }

  static regex(value, pattern) {
    return new RegExp(pattern, "u").test(value);
  }
}
