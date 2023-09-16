import {filter, keymap, valmap} from "runtime-compat/object";

const types = {
  /* array */
  blob: "BLOB",
  boolean: "INTEGER",
  datetime: "TEXT",
  embedded: "TEXT",
  f64: "REAL",
  i8: "INTEGER",
  i16: "INTEGER",
  i32: "INTEGER",
  i64: "INTEGER",
  json: "TEXT",
  primary: "INTEGER PRIMARY KEY",
  string: "TEXT",
  time: "TEXT",
  u8: "INTEGER",
  u16: "INTEGER",
  u32: "INTEGER",
};
const type = value => types[value];

const filter_null = results =>
  results.map(result => filter(result, ([, value]) => value !== null));

const predicate = criteria => {
  const keys = Object.keys(criteria);
  if (keys.length === 0) {
    return {where: "", bindings: {}};
  }

  const where = `where ${keys.map(key => `"${key}"=$${key}`).join(" and ")}`;

  return {where, bindings: criteria};
};

const change = delta => {
  const keys = Object.keys(delta);
  const set = keys.map(field => `"${field}"=$s_${field}`).join(",");
  return {
    set: `set ${set}`,
    bindings: keymap(delta, key => `s_${key}`),
  };
};

export default class Connection {
  schema = {
    create: async (name, description) => {
      const body =
        Object.entries(valmap(description, value => type(value.base)))
          .map(([column, dataType]) => `"${column}" ${dataType}`).join(",");
      const query = `create table if not exists ${name} (${body})`;
      this.connection.prepare(query).run();
    },
    delete: async name => {
      const query = `drop table if exists ${name}`;
      return this.connection.prepare(query).run();
    },
  };

  constructor(connection) {
    this.connection = connection;
  }

  find(collection, criteria = {}) {
    const {where, bindings} = predicate(criteria);
    const query = `select * from ${collection} ${where}`;
    const statement = this.connection.prepare(query);
    statement.safeIntegers(true);
    return filter_null(statement.all(bindings));
  }

  count(collection, criteria = {}) {
    const {where, bindings} = predicate(criteria);
    const query = `select count(*) from ${collection} ${where}`;
    return this.connection.prepare(query).pluck(true).get(bindings);
  }

  get(collection, primary, value) {
    const query = `select * from ${collection} where ${primary}=$primary`;
    const statement = this.connection.prepare(query);
    statement.safeIntegers(true);
    const result = statement.get({primary: value});
    return result === undefined
      ? result
      : filter(result, ([, $value]) => $value !== null);
  }

  insert(collection, primary, document) {
    const keys = Object.keys(document);
    const columns = keys.map(key => `"${key}"`);
    const values = keys.map(key => `$${key}`).join(",");
    const $predicate = columns.length > 0
      ? `(${columns.join(",")}) values (${values})`
      : "default values";
    const query = `insert into ${collection} ${$predicate}`;
    const {lastInsertRowid: id} = this.connection.prepare(query).run(document);
    return {...document, id};
  }

  update(collection, criteria = {}, delta = {}) {
    const {where, bindings} = predicate(criteria);
    const {set, bindings: bindings2} = change(delta);
    const query = `update ${collection} ${set} ${where}`;
    return this.connection.prepare(query).run({...bindings, ...bindings2})
      .changes;
  }

  delete(collection, criteria = {}) {
    const {where, bindings} = predicate(criteria);
    const query = `delete from ${collection} ${where}`;
    return this.connection.prepare(query).run({...bindings}).changes;
  }
}
