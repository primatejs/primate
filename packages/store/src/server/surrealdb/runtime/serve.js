import { Surreal } from "surrealdb.js";
import wrap from "../../../wrap.js";
import ident from "../../ident.js";
import Facade from "./Facade.js";

const name = "surrealdb";

export default ({
  host,
  port,
  path,
  namespace,
  database,
  username,
  password,
} = {}) => async _ => {
  const client = new Surreal();

  const url = `${host}:${port}/${path}`;
  const auth = username !== undefined && password !== undefined ?
    {
      username,
      password,
    }
    : {};
  await client.connect(url, { namespace, database, auth });

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
