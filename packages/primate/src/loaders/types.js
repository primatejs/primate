import { Path } from "rcompat/fs";
import { is } from "rcompat/invariant";
import { tryreturn } from "rcompat/sync";
import errors from "../errors.js";
import fs from "./common.js";

const filter = path => /^[a-z]/u.test(path.name);

export default async (log, directory) => {
  const types = (await fs({ log, directory, name: "types", filter }))
    .map(([name, type]) => [name, type.default]);

  const resolve = name => new Path(directory, name);
  types.every(([name, type]) => tryreturn(_ => {
    is(type).object();
    is(type.base).string();
    is(type.validate).function();
    return true;
  }).orelse(_ => errors.InvalidTypeExport.throw(resolve(`${name}.js`))),
  );

  types.every(([name]) =>
    /^(?:[a-z][^\W_]*)$/u.test(name) || errors.InvalidTypeName.throw(name));

  types.some(([name]) => ["get", "raw"].includes(name) &&
    errors.ReservedTypeName.throw(name));

  return Object.fromEntries(types);
};
