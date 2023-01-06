import Storable from "./Storable.js";

export default class InstanceType extends Storable {
  static is(value) {
    // no subclassing allowed, as [] instanceof Object === true et al.
    return value?.constructor === this.instance;
  }
}
