import {numeric} from "runtime-compat/dyndef";
import {filter, keymap, valmap} from "runtime-compat/object";
import {ident} from "../base.js";

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

export default ({
  /* filename to be used for storing the database, defaults to in-memory */
  filename = ":memory:",
} = {}) => async app => {
  const Driver = await app.depend("better-sqlite3", "store:sqlite");
  const client = new Driver(filename, {});

  return {
    name: "sqlite",
    client,
    start() {
      client.prepare("begin transaction").run();
    },
    rollback() {
      client.prepare("rollback transaction").run();
    },
    commit() {
      client.prepare("commit transaction").run();
    },
    end() {
      // noop
    },
    types: {
      primary: {
        validate(value) {
          if (numeric(value)) {
            return Number(value);
          }
          throw new Error(`\`${value}\` is not a valid primary key value`);
        },
        ...ident,
        out(value) {
          return Number(value);
        },
      },
      object: {
        in(value) {
          return JSON.stringify(value);
        },
        out(value) {
          return JSON.parse(value);
        },
      },
      number: {
        in(value) {
          return value;
        },
        out(value) {
          return Number(value);
        },
      },
      // in: driver accepts both number and bigint
      // out: find/get currently set statement.safeIntegers(true);
      bigint: ident,
      boolean: {
        in(value) {
          return value === true ? 1 : 0;
        },
        out(value) {
          // out: find/get currently set statement.safeIntegers(true);
          return Number(value) === 1;
        },
      },
      date: {
        in(value) {
          return value.toJSON();
        },
        out(value) {
          return new Date(value);
        },
      },
      string: ident,
    },
    exists(collection) {
      const where = "type='table' and name=$collection";
      const query = `select name from sqlite_master where ${where}`;
      return client.prepare(query).get({collection}) !== undefined;
    },
    create(collection, schema) {
      const body = Object.entries(valmap(schema, value => type(value)))
        .map(([column, dataType]) => `"${column}" ${dataType}`).join(",");
      const query = `create table ${collection} (${body})`;
      client.prepare(query).run();
    },
    find(collection, criteria = {}) {
      const {where, bindings} = predicate(criteria);
      const query = `select * from ${collection} ${where}`;
      const statement = client.prepare(query);
      statement.safeIntegers(true);
      return filter_null(statement.all(bindings));
    },
    count(collection, criteria = {}) {
      const {where, bindings} = predicate(criteria);
      const query = `select count(*) from ${collection} ${where}`;
      return client.prepare(query).pluck(true).get(bindings);
    },
    get(collection, primary, value) {
      const query = `select * from ${collection} where ${primary}=$primary`;
      const statement = client.prepare(query);
      statement.safeIntegers(true);
      const result = statement.get({primary: value});
      return result === undefined
        ? result
        : filter(result, ([, value]) => value !== null);
    },
    insert(collection, primary, document) {
      const keys = Object.keys(document);
      const columns = keys.map(key => `"${key}"`);
      const values = keys.map(key => `$${key}`).join(",");
      const predicate = columns.length > 0
        ? `(${columns.join(",")}) values (${values})`
        : "default values";
      const query = `insert into ${collection} ${predicate}`;
      const {lastInsertRowid: id} = client.prepare(query).run(document);
      return {...document, id};
    },
    update(collection, criteria = {}, delta) {
      const {where, bindings} = predicate(criteria);
      const {set, bindings: bindings2} = change(delta);
      const query = `update ${collection} ${set} ${where}`;
      return client.prepare(query).run({...bindings, ...bindings2}).changes;
    },
    delete(collection, criteria = {}) {
      const {where, bindings} = predicate(criteria);
      const query = `delete from ${collection} ${where}`;
      return client.prepare(query).run({...bindings}).changes;
    },
  };
};
