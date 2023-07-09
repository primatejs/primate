import {numeric} from "runtime-compat/dyndef";
import {valmap} from "runtime-compat/object";
import load from "../load.js";

const types = {
  string: "TEXT",
};
const type = value => types[value];

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
    },
    end() {
      client.prepare("COMMIT TRANSACTION").run();
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
    find(collection, criteria) {
      const results = client.prepare(`SELECT * FROM ${collection}`).all();
    },
    count(collection, criteria) {
      return client.prepare(`SELECT COUNT(*) FROM ${collection}`).pluck(true)
        .get();
    },
    get(collection, key, value) {},
    insert(collection, primary, document) {
      const columns = Object.keys(document);
      const values = columns.map(column => `@${column}`).join(",");
      const {lastInsertRowid: id} = client.prepare(`
        INSERT INTO ${collection} (${columns.join(",")}) VALUES (${values})
      `).run(document);
      return {...document, id};
    },
    update(collection, criteria, document) {},
    delete(collection, criteria) {},
  };
};
