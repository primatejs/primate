import {Path} from "runtime-compat/fs";
import {is} from "runtime-compat/dyndef";

import {default as driver, ident} from "../base.js";
import TransactionManager from "../TransactionManager.js";
import common from "../common.js";

// we can't depend on @primate/types here
const valid = /^[^\W_]{8}-[^\W_]{4}-[^\W_]{4}-[^\W_]{4}-[^\W_]{12}$/u;
const test = value => typeof value === "string" && valid.test(value);

export default async ({path}) => {
  is(path).string();

  const {file} = new Path(path);
  const read = async () => await file.exists ? file.json() : {};
  const write = async collections => {
    await file.write(JSON.stringify(collections));
  };
  const db = {collections: await read()};

  return () => ({
    ...driver("json", {
      primary: {
        validate(value) {
          if (test(value)) {
            return value;
          }
          throw new Error(`\`${value}\` is not a valid primary key value`);
        },
        ...ident,
      },
      object: ident,
      boolean: ident,
      number: ident,
      bigint: {
        in(value) {
          return value.toString();
        },
        out(value) {
          return BigInt(value);
        },
      },
      date: {
        in(value) {
          return value.toJSON();
        },
        out(value) {
          return new Date(value);
        },
      },
      string: ident,
    }, new TransactionManager({
        async read() {
          db.collections = await read();
        },
        async write() {
          await write(db.collections);
        },
        actions: common(db),
    })),
    client: {read, write},
  });
};
