import driver from "../base.js";
import TransactionManager from "../TransactionManager.js";
import common from "../common.js";

// we can't depend on @primate/types here
const valid = /^[^\W_]{8}-[^\W_]{4}-[^\W_]{4}-[^\W_]{4}-[^\W_]{12}$/u;
const test = value => typeof value === "string" && valid.test(value);

export default async () => {
  let storage = "{}";
  const read = () => JSON.parse(storage);
  const write = collections => {
    storage = JSON.stringify(collections);
  };
  const db = {collections: read()};

  return {
    ...driver("memory", {
      primary: {
        validate(value) {
          if (test(value)) {
            return value;
          }
          throw new Error(`\`${value}\` is not a valid primary key value`);
        },
      },
    }, new TransactionManager({
      async read() {
        db.collections = read();
      },
      async write() {
        write(db.collections);
      },
      actions: common(db),
    })),
    client: {read, write},
  };
};
