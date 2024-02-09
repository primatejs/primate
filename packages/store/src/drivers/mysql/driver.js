import { numeric } from "rcompat/invariant";
import { filter } from "rcompat/object";
import ident from "../ident.js";
import { peers } from "../common/exports.js";
import depend from "../../depend.js";
import wrap from "../../wrap.js";
import Facade from "./Facade.js";

const name = "mysql";
const dependencies = ["mysql2"];
const on = filter(peers, ([key]) => dependencies.includes(key));
const defaults = {
  host: "localhost",
  port: 3306,
};

export default ({
  host = defaults.host,
  port = defaults.port,
  database,
  user,
  password,
} = {}) => async _ => {
  await depend(on, `store:${name}`);
  const { default: mysql } = await import("mysql2/promise");

  const pool = mysql.createPool({
    host,
    port,
    database,
    user,
    password,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    namedPlaceholders: true,
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
    },
    object: {
      in(value) {
        return JSON.stringify(value);
      },
      out(value) {
        return JSON.parse(value);
      },
    },
    number: ident,
    bigint: {
      in(value) {
        return value.toString();
      },
      out(value) {
        return BigInt(value);
      },
    },
    boolean: {
      in(value) {
        return value === true ? 1 : 0;
      },
      out(value) {
        return Number(value) === 1;
      },
    },
    date: {
      in(value) {
        return value;
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
        const connection = await pool.getConnection();
        const facade = new Facade(connection);
        try {
          await connection.query("start transaction");
          const response = await next([...others, ...stores.map(([_, store]) =>
            [_, wrap(store, facade, types)]),
          ]);
          await connection.query("commit");
          return response;
        } catch (error) {
          await connection.query("rollback");
          // bubble up
          throw error;
        } finally {
          // noop, no end transaction
          pool.releaseConnection(connection);
        }
      };
    },
  };
};
