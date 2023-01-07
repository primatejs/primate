import MemoryDomain from "./MemoryDomain.js";

export default class House extends MemoryDomain {
  static fields = {
    name: String,
    location: String,
  };
}
