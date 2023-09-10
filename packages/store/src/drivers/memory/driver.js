import {ident} from "../base.js";
import Facade from "./Facade.js";
import wrap from "../../wrap.js";

// we can't depend on @primate/types here
const valid = /^[^\W_]{8}-[^\W_]{4}-[^\W_]{4}-[^\W_]{4}-[^\W_]{12}$/u;
const test = value => typeof value === "string" && valid.test(value);

export default () => async () => {
  const database = {
    collections: {},
  };
  const connection = {
    read(name) {
      return database.collections[name];
    },
    write(name, callback) {
      // do a read
      const collection = database.collections(name);
      database.collections[name] = callback(collection);
    },
  };

  const types = {
    primary: {
      validate(value) {
        if (test(value)) {
          return value;
        }
        throw new Error(`\`${value}\` is not a valid primary key value`);
      },
      ...ident,
    },
    object: ident,
    boolean: ident,
    number: ident,
    bigint: {
      in(value) {
        return value.toString();
      },
      out(value) {
        return BigInt(value);
      },
    },
    date: ident,
    string: ident,
  };

  return {
    name: "memory",
    types,
    async transact(stores) {
      return (others, next) => {
        const facade = new Facade(connection);
        return next([
          ...others, ...stores.map(([name, store]) =>
            [name, wrap(store, facade, types)]),
        ]);
      };
    },
  };
};
