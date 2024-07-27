import ident from "@primate/store/base/ident";
import wrap from "@primate/store/base/wrap";
import { name } from "@primate/store/surrealdb/common";
import Facade from "./Facade.js";
import { connect } from "./driver.js";

export default options => async () => {
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
