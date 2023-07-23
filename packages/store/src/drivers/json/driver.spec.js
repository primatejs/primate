import {Path} from "runtime-compat/fs";
import json from "./driver.js";
import base from "../base.test.js";

const path = new Path(import.meta.url).up(1).join("db.json");

const client = async () => (await json({path: `${path}`}))();

export default async test => {

  base(test, client, {
    after: async () => {
      if (await path.exists) {
        await path.file.remove();
      }
    },
  });
};
