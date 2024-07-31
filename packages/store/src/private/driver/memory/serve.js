import Facade from "#Facade";
import types from "#types";
import wrap from "#wrap";
import connect from "./connect.js";

// no conf
export default () => async () => {
  const client = await connect();

  return {
    name: "@primate/store/memory",
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
