import driver from "./driver.js";
import TransactionManager from "./TransactionManager.js";
import common from "./common.js";

export default async () => {
  let collections = {};

  const db = {collections: {}};
  const read = () => collections;
  const write = _collections => {
    collections = _collections;
  };

  return driver(new TransactionManager({
    async read() {
      db.collections = read();
    },
    async write() {
      write(db.collections);
    },
    operations: common(db),
  }));
};
