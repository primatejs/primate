import {Path} from "runtime-compat/fs";
import json from "./driver.js";
import base from "../base.test.js";

const path = new Path(import.meta.url).up(1).join("db.json");

export default test => {
  const driver = () => json({path: `${path}`});

  base(test, driver, {
    after: async () => {
      if (await path.exists) {
        await path.file.remove();
      }
    },
  });
};
