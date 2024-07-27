import Facade from "@primate/store/base/facade";
import types from "@primate/store/base/types";
import wrap from "@primate/store/base/wrap";
import { name } from "@primate/store/memory/common";
import { connect } from "./driver.js";

// no conf
export default () => async () => {
  const client = await connect();

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
