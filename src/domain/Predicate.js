import {is} from "runtime-compat/dyndef";
import Domain from "./Domain.js";
import Storable from "../types/Storable.js";

export default class Predicate {
  constructor(definition) {
    is(definition).string();
    const [name, ...params] = definition.split(":");
    this.name = name;
    this.params = params;
  }

  async check(property, document, Type) {
    is(property).string();
    is(document).instance(Domain);
    const {name, params} = this;
    if (document[name] === undefined) {
      is(Type).subclass(Storable);
      await Type.has(name, document[property], params);
    } else {
      await document[name](property, ...params);
    }
  }
}
