import Facade from "@primate/store/base/facade";
import types from "@primate/store/base/types";
import wrap from "@primate/store/base/wrap";
import { name } from "@primate/store/json/common";
import { connect } from "./driver.js";

export default options => async () => {
  const client = await connect(options);

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
