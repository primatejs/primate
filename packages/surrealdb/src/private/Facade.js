import typemap from "#typemap";
import make_sort from "@primate/store/sql/make-sort";
import is from "@rcompat/invariant/is";
import entries from "@rcompat/record/entries";
import { RecordId } from "surrealdb";

const null_to_undefined = delta =>
  entries(delta).mapValue(([, value]) => value === null ? undefined : value)
    .get();

const predicate = criteria => {
  const keys = Object.keys(criteria);
  if (keys.length === 0) {
    return { where: "", bindings: {} };
  }

  const where = `where ${keys.map(key =>
    `${key}=${criteria[key] instanceof RecordId ? "<record>" : ""}$${key}`,
  ).join(" and ")}`;

  return { where, bindings: criteria };
};

const change = delta => {
  const keys = Object.keys(delta);
  const set = keys.map(field => `${field}=$s_${field}`).join(",");
  return {
    set: `set ${set}`,
    bindings: entries(delta).mapKey(([key]) => `s_${key}`).get(),
  };
};

export default class Connection {
  schema = {
    create: async (name, description) => {
      const body =
        Object.entries(entries(description).mapValue(([, value]) => typemap(value.base)).get())
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

  async find(name, criteria = {}, projection = [], options = {}) {
    const { where, bindings } = predicate(criteria);
    const select = projection.length === 0 ? "*" : projection.join(", ");
    const rest = make_sort(options);
    const query = `select ${select} from ${name} ${where} ${rest}`;
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
    is(value).instance(RecordId);

    const query = `select * from ${value}`;
    const [{ result }] = await this.#query(query, { primary: value });

    return result.length === 0
      ? undefined
      : result[0];
  }

  async insert(name, primary, document) {
    const keys = Object.keys(document);
    const columns = keys.map(key => `${key}`);
    const values = keys.map(key => `$${key}`).join(",");
    const columns_values = columns.length > 0
      ? `(${columns.join(",")}) values (${values})`
      : "{}";
    const query = `insert into ${name} ${columns_values}`;
    const [{ result: [{ id }] }] = await this.#query(query, document);
    return { ...document, id };
  }

  async update(name, criteria = {}, delta = {}) {
    const { where, bindings } = predicate(criteria);
    const { set, bindings: changed } = change(null_to_undefined(delta));
    const query = `update ${name} ${set} ${where}`;
    const [{ result }] = await this.#query(query, { ...bindings, ...changed });
    return result.length;
  }

  async delete(collection, criteria = {}) {
    const { where, bindings } = predicate(criteria);
    const query = `delete from ${collection} ${where} return diff`;
    const [{ result }] = await this.#query(query, bindings);
    return result.length;
  }
}
