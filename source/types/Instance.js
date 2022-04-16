import Storeable from "./Storeable.js";

export default class InstanceType extends Storeable {
  static is(value) {
    // no subclassing allowed, as [] instanceof Object === true et al.
    return value?.constructor === this.instance;
  }
}
