import InstanceType from "./Instance.js";
import errors from "./errors/Date.json" assert {"type": "json"};

export default class DateType extends InstanceType {
  static get instance() {
    return Date;
  }

  static get errors() {
    return errors;
  }

  static is(value) {
    return value instanceof this.instance;
  }

  static deserialize(value) {
    return value instanceof this.instance ? value : new this.instance(value);
  }
}
