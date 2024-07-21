import ident from "@primate/store/base/ident";
import wrap from "@primate/store/base/wrap";
import { name } from "@primate/store/postgresql/common";
import { numeric } from "rcompat/invariant";
import { connect } from "./driver.js";
import Facade from "./Facade.js";

export default options => async () => {
  const client = connect(options);

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
        client.begin(async connection => {
          const facade = new Facade(connection);
          return next([
            ...others, ...stores.map(([name, store]) =>
              [name, wrap(store, facade, types)]),
          ]);
        });
    },
  };
};
