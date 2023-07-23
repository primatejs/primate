import {numeric} from "runtime-compat/dyndef";
import {filter, keymap, valmap} from "runtime-compat/object";
import load from "../load.js";
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

const filterNull = results =>
  results.map(result => filter(result, ([, value]) => value !== null));

const nullToUndefined = delta =>
  valmap(delta, value => value === null ? undefined : value);

const predicate = criteria => {
  const keys = Object.keys(criteria);
  if (keys.length === 0) {
    return {where: "", bindings: {}};
  }

  const where = `WHERE ${keys.map(key => `${key}=$${key}`)}`;

  return {where, bindings: criteria};
};

const change = delta => {
  const keys = Object.keys(delta);
  const set = keys.map(field => `${field}=$s_${field}`).join(",");
  return {
    set: `SET ${set}`,
    bindings: keymap(delta, key => `s_${key}`),
  };
};

export default ({
  host = "http://127.0.0.1",
  port = 8000,
  path = "rpc",
  ns = "default",
  db = "default",
  user,
  pass,
} = {}) => async () => {
  const Driver = await load("surrealdb.js");
  const client = new Driver(`${host}:${port}/${path}`);
  if (user !== undefined && pass !== undefined) {
    await client.signin({user, pass});
  }
  if (ns !== undefined && db !== undefined) {
    await client.use({ns, db});
  }

  return {
    name: "surrealdb",
    client,
    async start() {
      await client.query("BEGIN TRANSACTION;");
    },
    async rollback() {
      await client.query("CANCEL TRANSACTION;");
    },
    async commit() {
      await client.query("COMMIT TRANSACTION;");
    },
    end() {
      // noop
    },
    types: {
      primary: {
        validate(value) {
          return value;
        },
        ...ident,
      },
      object: ident,
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
      boolean: ident,
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
    async find(collection, criteria = {}) {
      const {where, bindings} = predicate(criteria);
      const query = `SELECT * FROM ${collection} ${where}`;
      const [{result}] = await client.query(query, bindings);
      return result;
    },
    async count(collection, criteria = {}) {
      const {where, bindings} = predicate(criteria);
      const query = `SELECT count() FROM ${collection} ${where}`;
      const [{result}] = await client.query(query, bindings);
      return result.length;
    },
    async get(collection, primary, value) {
      const query = `SELECT * FROM ${collection} WHERE ${primary}=$primary`;
      const [{result}] = await client.query(query, {primary: value});
      return result.length === 0
        ? undefined
        : result[0];
    },
    async insert(collection, primary, document) {
      const keys = Object.keys(document);
      const columns = keys.map(key => `${key}`);
      const values = keys.map(key => `$${key}`).join(",");
      const predicate = columns.length > 0
        ? `(${columns.join(",")}) VALUES (${values})`
        : "{}";
      const query = `INSERT INTO ${collection} ${predicate}`;
      const [{result: [{id}]}] = await client.query(query, document);
      return {...document, id};
    },
    async update(collection, criteria = {}, delta) {
      const {where, bindings} = predicate(criteria);
      const {set, bindings: bindings2} = change(nullToUndefined(delta));
      const query = `UPDATE ${collection} ${set} ${where}`;
      const [{result}] = await client.query(query, {...bindings, ...bindings2});
      return result.length;
    },
    async delete(collection, criteria = {}) {
      const {where, bindings} = predicate(criteria);
      const query = `DELETE FROM ${collection} ${where} RETURN DIFF`;
      const [{result}] = await client.query(query, bindings);
      return result.length;
    },
  };
};
