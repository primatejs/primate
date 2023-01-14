import {boolish} from "runtime-compat/dyndef";
import PrimitiveType from "./Primitive.js";
import errors from "./errors/Boolean.json" assert {type: "json"};

export default class BooleanType extends PrimitiveType {
  static type = "boolean";
  static instance = Boolean;
  static errors = errors;

  static coerce(value) {
    return boolish(value) ? value === "true" : value;
  }

  static true(value) {
    return value === true;
  }

  static false(value) {
    return value === false;
  }
}
