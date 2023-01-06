import {boolish} from "dyndef";
import PrimitiveType from "./Primitive.js";
import errors from "./errors/Boolean.json" assert {type: "json"};

export default class BooleanType extends PrimitiveType {
  static get type() {
    return "boolean";
  }

  static get instance() {
    return Boolean;
  }

  static get errors() {
    return errors;
  }

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
