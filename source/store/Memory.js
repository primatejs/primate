import Store from "./Store.js";

const not_found = -1;

export default class Memory extends Store {
  constructor(conf) {
    super(conf);
    this.collections = {};
  }

  some(collection, operation, criteria) {
    const keys = Object.keys(criteria);
    return this.use(collection)[operation](document =>
      // ¬∃ = ∀
      !keys.some(criterion => document[criterion] !== criteria[criterion])
    );
  }

  index(collection, _id = "") {
    const criteria = typeof _id === "string" ? {_id} : _id;
    return this.some(collection, "findIndex", criteria);
  }

  use(name) {
    this.collections[name] = this.collections[name] ?? [];
    return this.collections[name];
  }

  count(collection, criteria) {
    return this.find(collection, criteria).length;
  }

  one(collection, _id) {
    const index = this.index(collection, _id);
    return index !== not_found ? this.use(collection)[index] : undefined;
  }

  find(collection, criteria) {
    return criteria === undefined
      ? this.use(collection)
      : this.some(collection, "filter", criteria);
  }

  save(collection, {_id}, document) {
    const index = this.index(collection, _id);
    const use = this.use(collection);
    if (index !== not_found) {
      use.splice(index, 1, document);
    } else {
      use.push(document);
    }
  }

  delete(collection, criteria) {
    const index = this.index(collection, criteria._id);
    if (index !== not_found) {
      this.use(collection).splice(index, 1);
    }
  }
}
