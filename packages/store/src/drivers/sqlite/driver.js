import {numeric} from "runtime-compat/dyndef";
import {filter, keymap, valmap} from "runtime-compat/object";
import load from "../load.js";

const types = {
  string: "TEXT",
  embedded: "TEXT",
  number: "REAL",
  primary: "INTEGER PRIMARY KEY",
};
const type = value => types[value];

const filterNull = results =>
  results.map(result => filter(result, ([, value]) => value !== null));

const predicate = criteria => {
  const keys = Object.keys(criteria);
  if (keys.length === 0) {
    return {where: "", bindings: {}};
  }

  const where = `WHERE ${keys.map(key => `${key}=@${key}`)}`;

  return {where, bindings: criteria};
};

const change = delta => {
  const set = Object.keys(delta).map(field => `${field}=@s_${field}`).join(",");
  return {
    set: `SET ${set}`,
    bindings: keymap(delta, key => `s_${key}`),
  };
};

export default ({
  /* filename to be used for storing the database, defaults to in-memory */
  filename = ":memory:",
} = {}) => async () => {
  const Driver = await load("better-sqlite3");
  const client = new Driver(filename, {});

  return {
    name: "sqlite",
    client,
    start() {
      client.prepare("BEGIN TRANSACTION").run();
    },
    rollback() {
      client.prepare("ROLLBACK TRANSACTION").run();
    },
    commit() {
      /* noop */
      /* SQLite's COMMIT transaction is an alias for END */
      client.prepare("COMMIT TRANSACTION").run();
    },
    end() {
      //client.prepare("COMMIT TRANSACTION").run();
    },
    types: {
      primary: {
        validate(value) {
          if (numeric(value)) {
            return Number(value);
          }
          throw new Error(`\`${value}\` is not a valid primary key value`);
        },
      },
      datetime: {
        in(value) {
          return value;
        },
        out(value) {
          return new Date(value);
        },
      },
      boolean: {
        in(value) {
          return value === true ? 1 : 0;
        },
        out(value) {
          return value === 1;
        },
      },
      embedded: {
        in(value) {
          return JSON.stringify(value);
        },
        out(value) {
          return JSON.parse(value);
        },
      },
    },
    exists(collection) {
      return client.prepare(`
        SELECT name FROM sqlite_master WHERE type='table' AND name=@collection
      `).get({collection}) !== undefined;
    },
    create(collection, schema) {
      const body = Object.entries(valmap(schema, value => type(value)))
        .map(([column, dataType]) => `${column} ${dataType}`).join(",");
      client.prepare(`
        CREATE TABLE ${collection} (
          ${body} 
        )
      `).run();
    },
    find(collection, criteria = {}) {
      const {where, bindings} = predicate(criteria);
      const results = client.prepare(`SELECT * FROM ${collection} ${where}`)
        .all(bindings);
      return filterNull(results);
    },
    count(collection, criteria = {}) {
      const {where, bindings} = predicate(criteria);
      return client.prepare(`SELECT COUNT(*) FROM ${collection} ${where}`)
        .pluck(true).get(bindings);
    },
    get(collection, primary, value) {
      const result = client.prepare(`
        SELECT * FROM ${collection} WHERE ${primary}=@primary
      `).get({primary: value});
      return filter(result, ([, value]) => value !== null);
    },
    insert(collection, primary, document) {
      const columns = Object.keys(document);
      const values = columns.map(column => `@${column}`).join(",");
      const predicate = columns.length > 0
        ? `(${columns.join(",")}) VALUES (${values})`
        : "DEFAULT VALUES";
      const {lastInsertRowid: id} = client.prepare(`
        INSERT INTO ${collection} ${predicate}
      `).run(document);
      return {...document, id};
    },
    update(collection, criteria = {}, delta) {
      const {where, bindings} = predicate(criteria);
      const {set, bindings: bindings2} = change(delta);
      const query = `UPDATE ${collection} ${set} ${where}`;
      return client.prepare(query).run({...bindings, ...bindings2}).changes;
    },
    delete(collection, criteria = {}) {
      const {where, bindings} = predicate(criteria);
      const query = `DELETE FROM ${collection} ${where}`;
      return client.prepare(query).run({...bindings}).changes;
    },
  };
};
