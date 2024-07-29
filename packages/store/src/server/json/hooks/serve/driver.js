import is from "@rcompat/invariant/is";
import stringify from "@rcompat/object/stringify";
import file from "@rcompat/fs/file";

export const connect = async ({ database }) => {
  is(database).string();

  const fileref = file(database);
  const db = {
    collections: await fileref.exists() ? await fileref.json() : {},
  };

  return {
    read(name) {
      return db.collections[name] ?? [];
    },
    async write(name, callback) {
      db.collections[name] = await callback(this.read(name));
      // write to file
      await path.write(stringify(db.collections));
    },
  };
};
