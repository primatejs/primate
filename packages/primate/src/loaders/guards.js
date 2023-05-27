import errors from "../errors.js";
import {default as load, lc_first as filter} from "./common.js";

export default async (log, directory) => {
  const guards = await load({log, directory, name: "guards", filter,
    recursive: false});

  guards.some(([name, guard]) =>
    typeof guard !== "function" && errors.InvalidGuard.throw(name));

  return Object.fromEntries(guards);
};
