import FS from "rcompat/fs";
import { is } from "rcompat/invariant";
import o from "rcompat/object";
import wrap from "../../wrap.js";
import Facade from "../memory/Facade.js";
import types from "../memory/types.js";

export default ({ filename }) => async () => {
  is(filename).string();

  const path = new FS.File(filename);
  const database = {
    collections: await path.exists() ? await path.json() : {},
  };

  const connection = {
    read(name) {
      return database.collections[name] ?? [];
    },
    async write(name, callback) {
      database.collections[name] = await callback(this.read(name));
      // write to file
      await path.write(o.stringify(database.collections));
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
