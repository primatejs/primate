import filter from "@rcompat/object/filter";
import valmap from "@rcompat/object/valmap";

const remove_null = delta => filter(delta , ([, value]) => value !== null);
const remove_by_null = (document, delta) =>
  filter(document, ([key]) => delta[key] !== null);
const filter_in = (collection, criteria) => {
  if (criteria === undefined) {
    return collection;
  }
  const keys = Object.keys(criteria);
  return collection.filter(document =>
    keys.every(criterion => document[criterion] === criteria[criterion]));
};
const filter_out = (collection, criteria) => {
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
      !keys.some(criterion => document[criterion] !== criteria[criterion]),
    );
  }

  #find_index(name, criteria) {
    return this.#some(name, "findIndex", criteria);
  }

  async #filter(name, criteria) {
    return filter_in(await this.#read(name), criteria);
  }

  async exists(name) {
    const collection = await this.#read(name);
    return collection.length > 0;
  }

  async find(name, criteria, projection = [], options = {}) {
    const documents = await this.#filter(name, criteria);
    if (options.sort !== undefined) {
      const sort = Object.entries(
        valmap(options.sort, value => value === "asc" ? 1 : -1));
      documents.sort((d1, d2) => {
        for (const [field, direction] of sort) {
          if (d1[field] === d2[field]) {
            continue;
          }
          if (d1[field] < d2[field]) {
            return -1 * direction;
          }
          return direction;
        }
        return 0;
      });
    }

    return projection.length === 0
      ? documents
      : documents.map(document => filter(document,
        ([key]) => projection.includes(key)));
  }

  async count(...args) {
    return (await this.find(...args)).length;
  }

  async get(name, primary, value) {
    const collection = await this.#read(name);
    return collection[await this.#find_index(name, { [primary]: value })];
  }

  async insert(name, primary, document) {
    // generate id
    const result = { ...document, [primary]: crypto.randomUUID() };
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
        return { ...remove_by_null(document, delta), ...remove_null(delta) };
      }
      return document;
    }));
    return changed;
  }

  async delete(name, criteria) {
    const original_size = await this.count(name);
    await this.#write(name, collection =>
      criteria === undefined ? [] : filter_out(collection, criteria));
    return original_size - await this.count(name);
  }
}
