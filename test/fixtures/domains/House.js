import MemoryDomain from "./MemoryDomain.js";

export default class House extends MemoryDomain {
  static get fields() {
    return {
      name: String,
      location: String,
    };
  }
}
