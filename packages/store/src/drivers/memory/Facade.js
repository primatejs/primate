import crypto from "runtime-compat/crypto";
import {filter} from "runtime-compat/object";

const remove_null = delta => filter(delta , ([, value]) => value !== null);
const remove_by_null = (document, delta) =>
  filter(document, ([key]) => delta[key] !== null);
const filter_by = (collection, criteria) => {
  if (criteria === undefined) {
    return collection;
  }
  const keys = Object.keys(criteria);
  return collection.filter(document =>
    keys.some(criterion => document[criterion] !== criteria[criterion]));
};

export default class Connection {
  schema = {
    create: name => {
      this.#write(name, collection => collection ?? []);
    },
    delete: name => {
      this.#write(name, _ => undefined);
    },
  };

  constructor(connection) {
    this.connection = connection;
  }

  async #read(name) {
    return this.connection.read(name);
  }

  async #write(name, callback) {
    return this.connection.write(name, callback);
  }

  async #some(name, operation, criteria) {
    const keys = Object.keys(criteria);
    const collection = await this.#read(name);
    return collection[operation](document =>
      // ¬∃ = ∀
      !keys.some(criterion => document[criterion] !== criteria[criterion])
    );
  }

  #find_index(name, criteria) {
    return this.#some(name, "findIndex", criteria);
  }

  async #filter(name, criteria) {
    return filter_by(await this.#read(name), criteria);
  }

  async exists(name) {
    const collection = await this.#read(name);
    return collection.length > 0;
  }

  async find(name, criteria) {
    return this.#filter(name, criteria);
  }

  async count(...args) {
    return (await this.find(...args)).length;
  }

  async get(name, primary, value) {
    const collection = await this.#read(name);
    return collection[this.#find_index(name, {[primary]: value})];
  }

  async insert(name, primary, document) {
    // generate id
    const result = {[primary]: crypto.randomUUID(), ...document};
    await this.#write(name, collection => [...collection, result]);
    return result;
  }

  async update(name, criteria = {}, delta = {}) {
    const keys = Object.keys(criteria);
    let changed = 0;
    await this.#write(name, collection => collection.map(document => {
      // criteria satisfied
      if (!keys.some(by => document[by] !== criteria[by])) {
        changed++;
        return {...remove_by_null(document, delta), ...remove_null(delta)};
      }
      return document;
    }));
    return changed;
  }

  async delete(name, criteria) {
    const original_size = await this.count(name);
    await this.#write(name, collection =>
      criteria === undefined ? [] : filter_by(collection, criteria));
    return original_size - this.count(name);
  }
}
