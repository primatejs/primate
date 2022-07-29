import Person from "./domains/Person.js";
import {MemoryStore} from "../exports.js";

export default () => {
  Person._store = new MemoryStore();
  return new Person({name: "Mowgli", male: true});
};
