import {Path} from "runtime-compat/fs";
import json from "./driver.js";
import base from "../base.test.js";

const filename = new Path(import.meta.url).up(1).join("db.json");

const client = () => json({filename: `${filename}`})();

export default async test => {
  base(test, client, {
    after: async () => {
      if (await filename.exists) {
        await filename.file.remove();
      }
    },
  });
};
