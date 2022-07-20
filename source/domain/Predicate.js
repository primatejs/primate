import {is} from "dyndef";
import Domain from "./Domain.js";
import Storeable from "../types/Storeable.js";

export default class Predicate {
  constructor(definition) {
    is.string(definition);
    const [name, ...params] = definition.split(":");
    this.name = name;
    this.params = params;
  }

  async check(property, document, Type) {
    is.string(property);
    is.instance(document, Domain);
    const {name, params} = this;
    if (document[name] === undefined) {
      is.subclass(Type, Storeable);
      await Type.has(name, document[property], params);
    } else {
      await document[name](property, ...params);
    }
  }
}
