import Storeable from "./Storeable.js";

export default class PrimitiveType extends Storeable {
  static is(value) {
    return typeof value === this.type;
  }
}
