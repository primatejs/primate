import { File } from "rcompat/fs";
import json from "./driver.js";
import base from "../base.test.js";

const filename = new File(import.meta.url).up(1).join("db.json");

const client = () => json({ filename: `${filename}` })();

export default async test => {
  base(test, client, {
    after: async () => {
      await filename.remove();
    },
  });
};
