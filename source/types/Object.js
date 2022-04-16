import InstanceType from "./Instance.js";
import errors from "./errors/Object.json" assert {"type": "json"};

export default class ObjectType extends InstanceType {
  static get instance() {
    return Object;
  }

  static get errors() {
    return errors;
  }
}
