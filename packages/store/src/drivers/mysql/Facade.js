import o from "rcompat/object";
import typemap from "./typemap.js";

const filter_null = object => o.filter(object, ([, value]) => value !== null);
const filter_nulls = objects => objects.map(object => filter_null(object));

const predicate = criteria => {
  const keys = Object.keys(criteria);
  if (keys.length === 0) {
    return { where: "", bindings: {} };
  }

  const where = `where ${keys.map(key => `\`${key}\`=:${key}`).join(" and ")}`;

  return { where, bindings: criteria };
};

const change = delta => {
  const keys = Object.keys(delta);
  const set = keys.map(field => `\`${field}\`=:s_${field}`).join(",");
  return {
    set: `set ${set}`,
    bindings: o.keymap(delta, key => `s_${key}`),
  };
};

export default class Connection {
  schema = {
    create: async (name, description) => {
      const { connection } = this;
      const body =
        Object.entries(o.valmap(description, value => typemap(value.base)))
          .map(([column, dataType]) => `\`${column}\` ${dataType}`).join(",");
      const query = `create table if not exists ${name} (${body})`;
      await connection.query(query);
    },
    delete: async name => {
      const query = `drop table if exists ${name}`;
      await this.connection.query(query);
    },
  };

  constructor(connection) {
    this.connection = connection;
  }

  async find(collection, criteria = {}) {
    const { where, bindings } = predicate(criteria);
    const query = `select * from ${collection} ${where}`;
    const [result] = await this.connection.query(query, bindings);

    return filter_nulls(result);
  }

  async count(collection, criteria = {}) {
    const { where, bindings } = predicate(criteria);
    const query = `select count(*) as count from ${collection} ${where}`;
    const [[{ count }]] = await this.connection.query(query, bindings);
    return count;
  }

  async get(collection, primary, value) {
    const query = `select * from ${collection} where ${primary}=:primary`;
    const [[result]] = await this.connection.query(query, { primary: value });

    return result === undefined
      ? result
      : o.filter(result, ([, $value]) => $value !== null);
  }

  async insert(collection, primary, document) {
    const keys = Object.keys(document);
    const columns = keys.map(key => `\`${key}\``);
    const values = keys.map(key => `:${key}`).join(",");
    const $predicate = `(${columns.join(",")}) values (${values})`;
    const query = `insert into ${collection} ${$predicate}`;
    const [{ insertId: id }] = await this.connection.query(query, document);

    return { ...document, id };
  }

  async update(collection, criteria = {}, delta = {}) {
    const { where, bindings } = predicate(criteria);
    const { set, bindings: bindings2 } = change(delta);
    const query = `update ${collection} ${set} ${where}`;
    const params = { ... bindings, ...bindings2 };
    const [{ affectedRows }] = await this.connection.query(query, params);

    return affectedRows;
  }

  async delete(collection, criteria = {}) {
    const { where, bindings } = predicate(criteria);
    const query = `delete from ${collection} ${where}`;

    const [{ affectedRows }] = await this.connection.query(query, bindings);

    return affectedRows;
  }
}
