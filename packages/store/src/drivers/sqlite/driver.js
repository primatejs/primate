import {numeric} from "runtime-compat/invariant";
import {filter} from "runtime-compat/object";
import {runtime} from "runtime-compat/meta";
import ident from "../ident.js";
import {peers} from "../common/exports.js";
import depend from "../../depend.js";
import Pool from "../../pool/exports.js";
import wrap from "../../wrap.js";
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
  const $on = runtime === "bun" ? {"bun:sqlite": null} : on;
  const [{default: Connection}] = await depend($on, `store:${name}`);
  const pool = new Pool({
    manager: {
      new: () => new Connection(filename, {create: true}),
      kill: connection => connection.close(),
    },
  });

  const types = {
    primary: {
      validate(value) {
        if (typeof value === "number" || numeric(value)) {
          return Number(value);
        }
        throw new Error(`\`${value}\` is not a valid primary key value`);
      },
      ...ident,
      out(value) {
        // bigint
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
  };

  return {
    name,
    types,
    async transact(stores) {
      return async (others, next) => {
        const connection = await pool.acquire();
        const facade = new Facade(connection);
        try {
          connection.prepare("begin transaction").run();
          const response = await next([...others, ...stores.map(([_, store]) =>
            [_, wrap(store, facade, types)]),
          ]);
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
      };
    },
  };
};
