import {numeric} from "runtime-compat/dyndef";
import {filter} from "runtime-compat/object";
import {ident} from "../base.js";
import {peers} from "../common/exports.js";
import depend from "../../depend.js";
import Pool from "../../pool/exports.js";
import Facade from "./Facade.js";

const name = "sqlite";
const dependencies = ["better-sqlite3"];
const on = filter(peers, ([key]) => dependencies.includes(key));
const defaults = {
  filename: ":memory:",
};

export default ({
  filename = defaults.filename,
} = {}) => async () => {
  const [{default: Driver}] = await depend(on, `store:${name}`);
  const pool = new Pool({
    manager: {
      new: () => new Driver(filename, {}),
      kill: db => db.close(),
    },
  });

  return {
    name,
    async acquire() {
      const connection = await pool.acquire();
      return async logic => {
        await logic(connection);
        pool.release(connection);
      };
    },
    async transact(preparing) {
      const connection = await pool.acquire();
      return {
        stores: await preparing(new Facade(connection)),
        // extending to multistores: first get the other stores, and at last
        // return the route fn
        execute: async next => {
          try {
            connection.prepare("begin transaction").run();
            const response = await next();
            connection.prepare("commit transaction").run();
            return response;
          } catch (error) {
            connection.prepare("rollback transaction").run();
            // bubble up
            throw error;
          } finally {
            // noop, no end transaction
            pool.release(connection);
          }
        },
      };
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
  };
};
