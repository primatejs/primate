import { File } from "rcompat/fs";
import { identity } from "rcompat/function";
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
    (await File.collect(directory, /^.*.js$/u, { recursive }))
      .filter(filter)
      .map(async file => [
        `${file}`.replace(directory, _ => "").slice(1, -ending.length),
        await file.import(),
      ]));
  warn && await directory.exists() && empty(log)(objects, name, directory);

  return objects;
};

export const doubled = set => set.find((part, i, array) =>
  array.filter((_, j) => i !== j).includes(part));
