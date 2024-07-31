import serve from "#driver/json/serve";
import base from "#test";
import file from "@rcompat/fs/file";

const database = file(import.meta.url).up(1).join("db.json");

const client = () => serve({ database: `${database}` })();

export default async test => {
  base(test, client, {
    before: async () => {
      await database.remove();
    },
    after: async () => {
      await database.remove();
    },
  });
};
