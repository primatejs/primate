import types from "./types.js";
import Facade from "./Facade.js";
import wrap from "../../wrap.js";

export default () => async () => {
  const database = {
    collections: {},
  };
  const connection = {
    read(name) {
      return database.collections[name] ?? [];
    },
    write(name, callback) {
      // do a read
      database.collections[name] = callback(this.read(name));
    },
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
