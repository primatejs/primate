import errors from "../errors.js";
import {default as fs, lc_first as filter} from "./common.js";

export default async (log, directory, load = fs) => {
  const types = await load({log, directory, name: "types", filter});

  types.some(([name, type]) =>
    typeof type !== "function" && errors.InvalidType.throw(name));

  types.every(([name]) =>
    /^(?:[a-z][^\W_]*)$/u.test(name) || errors.InvalidTypeName.throw(name));

  types.some(([name]) => ["get", "raw"].includes(name) &&
    errors.ReservedTypeName.throw(name));

  return Object.fromEntries(types);
};
