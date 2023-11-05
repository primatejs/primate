import { keymap, valmap } from "rcompat/object";
import typemap from "./typemap.js";

const null_to_undefined = delta =>
  valmap(delta, value => value === null ? undefined : value);

const predicate = criteria => {
  const keys = Object.keys(criteria);
  if (keys.length === 0) {
    return { where: "", bindings: {} };
  }

  const where = `where ${keys.map(key => `${key}=$${key}`).join(" and ")}`;

  return { where, bindings: criteria };
};

const change = delta => {
  const keys = Object.keys(delta);
  const set = keys.map(field => `${field}=$s_${field}`).join(",");
  return {
    set: `set ${set}`,
    bindings: keymap(delta, key => `s_${key}`),
  };
};

export default class Connection {
  schema = {
    create: async (name, description) => {
      const body =
        Object.entries(valmap(description, value => typemap(value.base)))
          .filter(([column]) => column !== "id")
          .map(([column, dataType]) =>
            `define field ${column} on ${name} type option<${dataType}>;`)
          .join("\n");
      const query = `
        define table ${name} schemaless;
        ${body} 
      `;
      await this.#query(query);
    },
    delete: async name => {
      const query = `remove table ${name}`;
      await this.#query(query);
    },
  };

  constructor(connection) {
    this.connection = connection;
  }

  #query(...args) {
    return this.connection.query_raw(...args);
  }

  async find(name, criteria = {}) {
    const { where, bindings } = predicate(criteria);
    const query = `select * from ${name} ${where}`;
    const [{ result }] = await this.#query(query, bindings);
    return result;
  }

  async count(name, criteria = {}) {
    const { where, bindings } = predicate(criteria);
    const query = `select count() from ${name} ${where}`;
    const [{ result }] = await this.#query(query, bindings);
    return result.length;
  }

  async get(name, primary, value) {
    const query = `select * from ${name} where ${primary}=$primary`;
    const [{ result }] = await this.#query(query, { primary: value });
    return result.length === 0
      ? undefined
      : result[0];
  }

  async insert(name, primary, document) {
    const keys = Object.keys(document);
    const columns = keys.map(key => `${key}`);
    const values = keys.map(key => `$${key}`).join(",");
    const predicate = columns.length > 0
      ? `(${columns.join(",")}) values (${values})`
      : "{}";
    const query = `insert into ${name} ${predicate}`;
    const [{ result: [{ id }] }] = await this.#query(query, document);
    return { ...document, id };
  }

  async update(name, criteria = {}, delta = {}) {
    const { where, bindings } = predicate(criteria);
    const { set, bindings: bindings2 } = change(null_to_undefined(delta));
    const query = `update ${name} ${set} ${where}`;
    const [{ result }] = await this.#query(query, { ...bindings, ...bindings2 });
    return result.length;
  }

  async delete(collection, criteria = {}) {
    const { where, bindings } = predicate(criteria);
    const query = `delete from ${collection} ${where} return diff`;
    const [{ result }] = await this.#query(query, bindings);
    return result.length;
  }
}
