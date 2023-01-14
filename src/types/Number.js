import {numeric} from "runtime-compat/dyndef";
import PrimitiveType from "./Primitive.js";
import errors from "./errors/Number.json" assert {type: "json"};

export default class NumberType extends PrimitiveType {
  static type = "number";
  static instance = Number;
  static errors = errors;

  static coerce(value) {
    return numeric(value) ? Number(value) : value;
  }

  static integer(value) {
    return Number.isInteger(value);
  }

  static positive(value) {
    return value > 0;
  }

  static negative(value) {
    return value < 0;
  }

  static between(value, min, max) {
    return value >= min && value <= max;
  }

  static min(value, minimum) {
    return value >= Number(minimum);
  }

  static max(value, maximum) {
    return value >= Number(maximum);
  }
}
