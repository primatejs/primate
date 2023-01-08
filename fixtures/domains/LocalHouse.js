import {Storable} from "../../exports.js";

export default class extends Storable {
  static serialize({name, location}) {
    return `${name} in ${location}`;
  }

  static deserialize(name_location) {
    const [name, location] = name_location.split("in").map(_ => _.trim());
    return {name, location};
  }

  static type_error() {
    return "Must be an object with {name, location}";
  }

  static is(value) {
    return typeof value.name === "string" && typeof value.location === "string";
  }
}
