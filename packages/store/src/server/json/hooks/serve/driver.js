import { File } from "rcompat/fs";
import { is } from "rcompat/invariant";
import * as O from "rcompat/object";

export const connect = async ({ database }) => {
  is(database).string();

  const path = new File(database);
  const db = {
    collections: await path.exists() ? await path.json() : {},
  };

  return {
    read(name) {
      return db.collections[name] ?? [];
    },
    async write(name, callback) {
      db.collections[name] = await callback(this.read(name));
      // write to file
      await path.write(O.stringify(db.collections));
    },
  };
};
