import {filter} from "runtime-compat/object";
import ident from "../ident.js";
import {peers} from "../common/exports.js";
import depend from "../../depend.js";
import Facade from "./Facade.js";
import wrap from "../../wrap.js";

const name = "surrealdb";
const dependencies = ["surrealdb.js"];
const on = filter(peers, ([key]) => dependencies.includes(key));
const defaults = {
  host: "http://localhost",
  port: 8000,
  path: "rpc",
};

export default ({
  host = defaults.host,
  port = defaults.port,
  path = defaults.path,
  ns,
  db,
  user,
  pass,
} = {}) => async _ => {
  const [{default: Client}] = await depend(on, `store:${name}`);
  const client = new Client(`${host}:${port}/${path}`);

  if (user !== undefined && pass !== undefined) {
    await client.signin({user, pass});
  }
  if (ns !== undefined && db !== undefined) {
    await client.use({ns, db});
  }

  const types = {
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
    bigint: {
      in(value) {
        return value.toString();
      },
      out(value) {
        return BigInt(value);
      },
    },
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
  };

  return {
    name,
    types,
    async transact(stores) {
      return (others, next) => {
        const facade = new Facade(client);
        return next([
          ...others, ...stores.map(([name, store]) =>
            [name, wrap(store, facade, types)]),
        ]);
      };
    },
  };
};
