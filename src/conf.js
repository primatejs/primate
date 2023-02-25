import {Path} from "runtime-compat/filesystem";
import {EagerEither} from "runtime-compat/functional";
import cache from "./cache.js";
import extend from "./extend.js";
import preset from "./preset/primate.js";

const qualify = (root, paths) =>
  Object.keys(paths).reduce((sofar, key) => {
    const value = paths[key];
    sofar[key] = typeof value === "string"
      ? new Path(root, value)
      : qualify(`${root}/${key}`, value);
    return sofar;
  }, {});

export default async (filename = "primate.js") => {
  const root = Path.resolve();
  const conffile = root.join(filename);
  const conf = await EagerEither
    .try(async () => extend(preset, (await import(conffile)).default))
    .match({left: () => preset})
    .get();
  const paths = qualify(root, conf.paths);
  return cache("conf", filename, () => {
    return {...conf, paths, root};
  });
};
