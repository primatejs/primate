import is from "@rcompat/invariant/is";
import stringify from "@rcompat/object/stringify";
import file from "@rcompat/fs/file";

export default async ({ database }) => {
  is(database).string();

  const dbfile = file(database);
  const db = {
    collections: await dbfile.exists() ? await dbfile.json() : {},
  };

  return {
    read(name) {
      return db.collections[name] ?? [];
    },
    async write(name, callback) {
      db.collections[name] = await callback(this.read(name));
      // write to file
      await dbfile.write(stringify(db.collections));
    },
  };
};
