import { File } from "rcompat/fs";
import { is } from "rcompat/invariant";
import { tryreturn } from "rcompat/sync";
import { BadTypeExport, BadTypeName, ReservedTypeName } from "primate/errors";
import fs from "./common.js";

const filter = path => /^[a-z]/u.test(path.name);

export default async (log, directory, load = fs) => {
  const types = (await load({ log, directory, name: "types", filter }))
    .map(([name, type]) => [name, type.default]);

  const resolve = name => File.join(directory, name);
  types.every(([name, type]) => tryreturn(_ => {
    is(type).object();
    is(type.base).string();
    is(type.validate).function();
    return true;
  }).orelse(_ => BadTypeExport.throw(resolve(`${name}.js`))));

  const good_type_name = /^(?:[a-z][^\W_]*)$/u;
  types.every(([name]) => good_type_name.test(name) || BadTypeName.throw(name));

  types.some(([name]) => ["get", "raw"].includes(name) &&
    ReservedTypeName.throw(name));

  return Object.fromEntries(types);
};
