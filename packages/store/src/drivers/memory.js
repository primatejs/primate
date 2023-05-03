import driver from "./driver.js";
import TransactionManager from "./TransactionManager.js";
import common from "./common.js";

export default async () => {
  let storage = "{}";
  const read = () => JSON.parse(storage);
  const write = collections => {
    storage = JSON.stringify(collections);
  };
  const db = {collections: read()};

  return driver("memory", new TransactionManager({
    async read() {
      db.collections = read();
    },
    async write() {
      write(db.collections);
    },
    operations: common(db),
  }));
};
