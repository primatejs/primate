import Storable from "./Storable.js";

export default class PrimitiveType extends Storable {
  static is(value) {
    return typeof value === this.type;
  }
}
