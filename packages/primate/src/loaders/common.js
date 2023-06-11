import {Path} from "runtime-compat/fs";
import {identity} from "runtime-compat/function";
import {warn} from "../errors.js";

const ending = ".js";

export default async ({
  log,
  directory,
  filter = identity,
  name = "routes",
  recursive = true,
} = {}) => {
  const objects = directory === undefined ? [] : await Promise.all(
    (await Path.collect(directory, /^.*.js$/u, {recursive}))
      .filter(filter)
      .map(async path => [
        `${path}`.replace(directory, _ => "").slice(1, -ending.length),
        (await import(path)).default,
      ]));
  await Path.exists(directory) && warn.empty(log)(objects, name, directory);

  return objects;
};

export const lc_first = path => /^[a-z]/u.test(path.name);

export const doubled = set => set.find((part, i, array) =>
  array.filter((_, j) => i !== j).includes(part));
