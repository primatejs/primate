import { File } from "rcompat/fs";
import * as O from "rcompat/object";
import { is } from "rcompat/invariant";
import wrap from "../../../wrap.js";
import Facade from "../../memory/runtime/Facade.js";
import types from "../../memory/runtime/types.js";

export default database => async () => {
  is(database).string();

  const path = new File(database);
  const db = {
    collections: await path.exists() ? await path.json() : {},
  };

  const connection = {
    read(name) {
      return db.collections[name] ?? [];
    },
    async write(name, callback) {
      db.collections[name] = await callback(this.read(name));
      // write to file
      await path.write(O.stringify(db.collections));
    },
  };

  return {
    name: "json",
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
