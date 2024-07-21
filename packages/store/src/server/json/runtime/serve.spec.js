import base from "@primate/store/base/test";
import { File } from "rcompat/fs";
import serve from "./serve.js";

const database = new File(import.meta.url).up(1).join("db.json");

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
