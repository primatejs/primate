import Facade from "#Facade";
import types from "#types";
import wrap from "#wrap";
import connect from "./connect.js";

export default options => async () => {
  const client = await connect(options);

  return {
    name: "@primate/store/json",
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
