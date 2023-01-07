import Animal from "./Animal.js";
import House from "./House.js";
import LocalHouse from "./LocalHouse.js";

export default class Person extends Animal {
  static fields = {
    name: [String, "unique", "length:6"],
    "?age": [Number, "positive"],
    male: Boolean,
    fictional: value => value ?? true,
    created: value => value ?? new Date(),
    "?likes": [String, "between:5:8"],
    likes: {
      type: String,
      predicates: ["between:5:8"],
      in: value => value ?? "jungle",
    },
    "?mother_id": Animal,
    "?relatives": Array,
    "?house_id": House,
    "?houses_ids": Array,
    "?local_house": LocalHouse,
  };

  get real() {
    return !this.fictional;
  }

  set real(value) {
    this.fictional = !value;
  }

  tell_name_to(value) {
    return `${value}, my name is ${this.name}`;
  }

  change_name_to(value) {
    this.name = value;
  }

  get_mother() {
    return Animal.one({_id: this.mother_id});
  }
}
