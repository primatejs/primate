import { EmptyDirectory } from "@primate/core/errors";
import array_empty from "@rcompat/array/empty";
import collect from "@rcompat/fs/collect";
import identity from "@rcompat/function/identity";

const empty = log => (objects, name, path) =>
  array_empty(objects) && EmptyDirectory.warn(log, name, path);

export default async ({
  log,
  directory,
  name = "routes",
  filter = identity,
  recursive = true,
  warn = true,
} = {}) => {
  const objects = directory === undefined ? [] : await Promise.all(
    (await collect(directory, /^.*.js$/u, { recursive }))
      .filter(filter)
      .map(async file => [
        `${file}`.replace(directory, _ => "").slice(1, -".js".length),
        await file.import(),
      ]));
  warn && await directory.exists() && empty(log)(objects, name, directory);

  return objects;
};

export const doubled = set => set.find((part, i, array) =>
  array.filter((_, j) => i !== j).includes(part));
