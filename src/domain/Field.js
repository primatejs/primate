import DomainType from "../types/Domain.js";
import Predicate from "./Predicate.js";
import {PredicateError} from "../errors.js";
import Storable from "../types/Storable.js";
import * as types from "../types/types.js";
import cache from "../cache.js";
import {constructible, defined, is, maybe} from "runtime-compat/dyndef";

const builtins = Object.values(types).reduce((aggregate, Type) => {
  aggregate[Type.instance] = Type;
  return aggregate;
}, {});

const as_array = field => ({type: field[0], predicates: field.slice(1)});

const as_object = field => field instanceof Array ? as_array(field) : field;

const as_function = field => ({in: field,
  type: field(undefined, {}).constructor});

const as_non_constructible =
  field => typeof field === "function" ? as_function(field) : as_object(field);

const parse = field => constructible(field)
  ? {type: field}
  : as_non_constructible(field);

export default class Field {
  constructor(property, definition, options) {
    defined(property, "`property` required");
    this.property = property;
    this.definition = parse(definition);
    this.options = options ?? {transient: false, optional: false};
    is(this.Type).constructible();
    is(this.type).subclass(Storable);
    maybe(this.definition.predicates).array();
  }

  static resolve(name) {
    defined(name, "`name` required");
    const options = {
      optional: name.includes("?"),
      transient: name.includes("~"),
    };
    const property = name.replaceAll("~", "").replaceAll("?", "");
    return {options, property};
  }

  get type() {
    return builtins[this.Type] ?? this.custom;
  }

  get custom() {
    return this.isDomain ? DomainType : this.Type;
  }

  get isDomain() {
    return this.Type.prototype instanceof DomainType.instance;
  }

  get Type() {
    return this.definition.type;
  }

  get predicates() {
    return cache(this, "predicates", () => {
      const predicates = this.definition.predicates ?? [];
      return predicates.map(name => new Predicate(name));
    });
  }

  by_id(id) {
    return this.Type.by_id(id);
  }

  in(property, document) {
    const value = document[property];
    return this.definition.in?.(value, document) ?? value;
  }

  async verify(property, document) {
    document[property] = await this.in(property, document);
    try {
      await this.type.verify(property, document, this);
      return true;
    } catch (error) {
      if (error instanceof PredicateError) {
        return error.message;
      }
      throw error;
    }
  }

  serialize(value) {
    return value === undefined ? undefined : this.type.serialize(value);
  }

  deserialize(value) {
    return value === undefined ? undefined : this.type.deserialize(value);
  }
}
