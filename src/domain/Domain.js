import crypto from "runtime-compat/crypto";
import {Eager} from "runtime-compat/functional";
import Field from "./Field.js";
import {PredicateError} from "../errors.js";
import Store from "../store/Store.js";
import cacheModule from "../cache.js";
import DomainType from "../types/Domain.js";

export default class Domain {
  static stores_directory = "stores";
  static store_file = "default.js";

  static {
    // avoid transitive cyclic dependency between Domain and Field
    DomainType.instance = Domain;
    this.cache = {};
  }

  constructor(document) {
    const errors = {};
    this.define("_id", {
      type: String,
      predicates: ["unique"],
      in: value => value ?? crypto.randomUUID(),
    });
    return new Proxy(this, {get: (target, property, receiver) =>
      Reflect.get(target, property, receiver) ?? target.#proxy(property),
    }).set({...document, errors});
  }

  get Class() {
    return this.constructor;
  }

  static fields = {};

  static get _fields() {
    // initialize programmatic defines
    cacheModule(this, "initialized", () => {new this();});
    Object.keys(this.fields).map(name => this.define(name, this.fields[name]));
    return cacheModule(this, "fields", () => ({}));
  }

  static get store() {
    return Eager.resolve(cacheModule(this, "store", () =>
      Store.get(this.stores_directory, this.store_file)
    ));
  }

  static get collection() {
    return this.name.toLowerCase();
  }

  static get properties() {
    const properties = [];
    const fields = this._fields;
    for (const key in fields) {
      const field = fields[key];
      if (!field.options.transient) {
        properties.push(key);
      }
    }
    return properties;
  }

  static define(name, definition) {
    const fields = cacheModule(this, "fields", () => ({}));
    const {property, options} = Field.resolve(name);
    if (fields[property] === undefined) {
      fields[property] = new Field(property, definition, options);
    }
  }

  define(name, definition) {
    this.Class.define(name, definition);
    return this;
  }

  get() {
    return this.properties
      .filter(property => property !== "_id")
      .reduce((document, property) => {
        document[property] = this[property];
        return document;
      }, {});
  }

  set(document = {}) {
    return Object.assign(this, document);
  }

  #proxy(property) {
    return typeof property === "string" ? this.#link(property) : this[property];
  }

  #link(name) {
    const field = this.fields[`${name}_id`];
    if (field?.isDomain) {
      const {collection} = field.Type;
      const {cache} = this.Class;
      if (cache[collection] === undefined) {
        cache[collection] = {};
      }
      if (cache[collection][this[`${name}_id`]] === undefined) {
        cache[collection][this[`${name}_id`]] = field.by_id(this[`${name}_id`]);
      }
      return cache[collection][this[`${name}_id`]];
    }
    return undefined;
  }

  // Serializing is done from the instance's point of view.
  async serialize() {
    const {properties, fields} = this;
    return (await Promise.all(properties.map(async property =>
      ({property, value: await fields[property].serialize(this[property])}))))
      .filter(({value}) => value !== undefined)
      .reduce((document, {property, value}) => {
        document[property] = value;
        return document;
      }, {});
  }

  // Deserializing is done from the class's point of view.
  static deserialize(serialized) {
    const fields = this._fields;
    return new this(Object.keys(serialized)
      .filter(property => fields[property] !== undefined)
      .map(property =>
        ({property, value: fields[property].deserialize(serialized[property])}))
      .reduce((document, {property, value}) => {
        document[property] = value;
        return document;
      }, {}));
  }

  get fields() {
    return this.Class._fields;
  }

  get collection() {
    return this.Class.collection;
  }

  get properties() {
    return this.Class.properties;
  }

  get store() {
    return this.Class.store;
  }

  get new() {
    return this._id === undefined;
  }

  async verify(delta) {
    this.set(delta);
    const {fields} = this;
    this.errors = (await Promise.all(Object.keys(fields).map(async property =>
      ({property, value: await fields[property].verify(property, this)}))))
      .filter(result => typeof result.value === "string")
      .reduce((errors, result) => {
        errors[result.property] = result.value;
        return errors;
      }, {});
    return Object.keys(this.errors).length === 0;
  }

  async save(delta) {
    return this.new ? this.insert(delta) : this.update(delta);
  }

  async savewith(delta, after = () => undefined) {
    const verified = await this.verify(delta);
    if (verified) {
      const document = await this.serialize();
      await this.store.save(this.collection, {_id: document._id}, document);
      const {cache} = this.Class;
      if (cache[this.collection]?.[document._id] !== undefined) {
        delete cache[this.collection][document._id];
      }
      await after();
    }
    return verified;
  }

  async insert(delta) {
    delete this._id;
    return this.savewith(delta, () => this.inserted());
  }

  inserted() {
    return this;
  }

  async update(delta) {
    const old = await this.Class.by_id(this._id);
    return this.savewith(delta, () => this.updated(old));
  }

  updated() {
    return this;
  }

  async delete() {
    return this.store.delete(this.collection, {_id: this._id});
  }

  static async delete(criteria) {
    return this.store.delete(this.collection, criteria);
  }

  static by_id(_id) {
    return new Eager(async resolve => {
      const result = await this.store.find(this.collection, {_id: await _id});
      resolve(result.length > 0 ? this.deserialize(result[0]) : undefined);
    });
  }

  static first(criteria, options) {
    return new Eager(async resolve => {
      const result = await this.store.one(this.collection, criteria, options);
      resolve(result === undefined ? undefined : this.deserialize(result));
    });
  }

  static one(criteria) {
    return this[typeof criteria === "object" ? "first" : "by_id"](criteria);
  }

  static async touch(criteria) {
    return await this.one(criteria) ?? new this();
  }

  static async find(criteria, options) {
    const results = await this.store.find(this.collection, criteria, options);
    return results.map(result => this.deserialize(result));
  }

  static count(criteria) {
    return this.store.count(this.collection, criteria);
  }

  static async exists(criteria) {
    return await this.count(criteria) > 0;
  }

  async exists(property) {
    if (!await this.Class.exists({[property]: this[property]})) {
      throw new PredicateError(`No document exists with this ${property}`);
    }
  }

  static async unique(criteria, _id) {
    const one = await this.count({...criteria, _id});
    const count = await this.count(criteria);
    return count - one === 0;
  }

  async unique(property) {
    if (!await this.Class.unique({[property]: this[property]}, this._id)) {
      throw new PredicateError("Must be unique");
    }
  }

  async unique_by(property, by_property) {
    if (!await this.Class.unique({
      [property]: await this[property],
      [by_property]: await this[by_property],
    }, this._id)) {
      throw new PredicateError(`Must be unique in respect to ${by_property}`);
    }
  }

  static async insert(document) {
    return new this(document).save();
  }
}
