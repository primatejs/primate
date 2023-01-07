import MemoryDomain from "./MemoryDomain.js";
import House from "./House.js";

export default class Animal extends MemoryDomain {
  static fields = {
    name: [String, "unique"],
    male: Boolean,
    "?likes": Array,
    "?house_id": House,
  };

  get female() {
    return !this.male;
  }

  set female(value) {
    this.male = !value;
  }

  howl() {
    return `${this.name} is howling`;
  }
}
