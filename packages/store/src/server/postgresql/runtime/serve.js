import Driver from "postgres";
import { numeric } from "rcompat/invariant";
import wrap from "../../../wrap.js";
import ident from "../../ident.js";
import Facade from "./Facade.js";

const name = "postgresql";

export default ({ host, port, database, username, password }) => async () => {
  const driver = new Driver({
    host,
    port,
    db: database,
    user: username,
    pass: password,
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
    name,
    types,
    async transact(stores) {
      return (others, next) =>
        driver.begin(async connection => {
          const facade = new Facade(connection);
          return next([
            ...others, ...stores.map(([name, store]) =>
              [name, wrap(store, facade, types)]),
          ]);
        });
    },
  };
};
