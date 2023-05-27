import {Path} from "runtime-compat/fs";
import {warn} from "../errors.js";
import {identity} from "runtime-compat/function";

const ending = ".js";

export default async ({
  log,
  directory,
  filter = identity,
  name,
  recursive = true,
} = {}) => {
  const objects = directory === undefined ? [] : await Promise.all(
    (await Path.collect(directory, /^.*.js$/u, {recursive}))
      .filter(filter)
      .map(async path => [
        `${path}`.replace(directory, () => "").slice(1, -ending.length),
        (await import(path)).default,
      ]));
  warn.empty(log)(objects, name, directory);

  return objects;
};

export const lc_first = path => /^[a-z]/u.test(path.name);

export const doubled = set => set.find((part, i, array) =>
  array.filter((_, j) => i !== j).includes(part));
