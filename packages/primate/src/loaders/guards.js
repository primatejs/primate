import errors from "../errors.js";
import {default as fs, lc_first as filter} from "./common.js";

export default async (log, directory, load = fs) => {
  const guards = await load({log, directory, name: "guards", filter,
    recursive: false});

  guards.some(([name, guard]) =>
    typeof guard !== "function" && errors.InvalidGuard.throw(name));

  guards.every(([name]) =>
    /^(?:[a-z][^\W_]*)$/u.test(name) || errors.InvalidGuardName.throw(name));

  return Object.fromEntries(guards);
};
