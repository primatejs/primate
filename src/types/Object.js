import InstanceType from "./Instance.js";
import errors from "./errors/Object.json" assert {type: "json"};

export default class ObjectType extends InstanceType {
  static instance = Object;
  static errors = errors;
}
