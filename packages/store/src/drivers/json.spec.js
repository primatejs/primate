import {Path} from "runtime-compat/fs";
import json from "./json.js";
import base from "./base.test.js";

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

  test.case("types", async assert => {
    const {types: {datetime, bigint}} = await driver();
    const d = new Date();
    assert(datetime.out(datetime.in(d))).equals(d);
    assert(bigint.out(bigint.in(1n))).equals(1n);
  });
};
