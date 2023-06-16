import {Path} from "runtime-compat/fs";
import {identity} from "runtime-compat/function";
import errors from "../errors.js";

const ending = ".js";

const empty = log => (objects, name, path) =>
  Object.keys(objects).length === 0
    && errors.EmptyDirectory.warn(log, name, path);

export default async ({
  log,
  directory,
  filter = identity,
  name = "routes",
  recursive = true,
  warn = true,
} = {}) => {
  const objects = directory === undefined ? [] : await Promise.all(
    (await Path.collect(directory, /^.*.js$/u, {recursive}))
      .filter(filter)
      .map(async path => [
        `${path}`.replace(directory, _ => "").slice(1, -ending.length),
        (await import(path)).default,
      ]));
  warn && await Path.exists(directory) && empty(log)(objects, name, directory);

  return objects;
};

export const doubled = set => set.find((part, i, array) =>
  array.filter((_, j) => i !== j).includes(part));
