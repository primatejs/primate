import {Path} from "runtime-compat/fs";

import {is} from "runtime-compat/dyndef";
import driver from "./driver.js";
import TransactionManager from "./TransactionManager.js";
import common from "./common.js";

export default async path => {
  is(path).string();

  const {file} = new Path(path);
  const read = async () => await file.exists ? file.json() : {};
  const write = async collections => {
    await file.write(JSON.stringify(collections));
  };
  const db = {collections: await read()};

  return driver("json", new TransactionManager({
    async read() {
      db.collections = await read();
    },
    async write() {
      await write(db.collections);
    },
    operations: common(db),
  }));
};
