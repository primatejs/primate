import {Path} from "runtime-compat/fs";

import {is} from "runtime-compat/dyndef";
import driver from "./driver.js";
import TransactionManager from "./TransactionManager.js";
import common from "./common.js";

export default async ({path}) => {
  is(path).string();

  const {file} = new Path(path);
  const read = async () => await file.exists ? file.json() : {};
  const write = async collections => {
    await file.write(JSON.stringify(collections));
  };
  const db = {collections: await read()};

  return {
    ...driver("json", {
      primary: {
        validate(value) {
          return value;
        },
      },
      float: {
        in(value) {
          return value;
        },
        out(value) {
          const out = Number(value);
          if (Number.isNaN(out)) {
            throw new Error();
          }
          return out;
        },
      },
      bigint: {
        in(value) {
          return value.toString();
        },
        out(value) {
          return BigInt(value);
        },
      },
      datetime: {
        in(value) {
          return value.toJSON();
        },
        out(value) {
          return new Date(value);
        },
      },
    }, new TransactionManager({
        async read() {
          db.collections = await read();
        },
        async write() {
          await write(db.collections);
        },
        operations: common(db),
    })),
    client: {read, write},
  };
};
