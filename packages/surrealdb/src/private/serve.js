import Facade from "#Facade";
import connect from "#connect";
import ident from "@primate/store/core/ident";
import wrap from "@primate/store/core/wrap";
import { RecordId } from "surrealdb";
import defaults from "#defaults";

export default ({
  host = defaults.host,
  port = defaults.port,
  path = defaults.path,
  namespace,
  database,
  username,
  password,
} = {}) => async () => {
  const options = { host, port, path, namespace, database, username, password };
  const client = await connect(options);

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
        return value;
      },
      out(value) {
        return new Date(value);
      },
    },
    string: ident,
  };

  return {
    name: "@primate/surrealdb",
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
