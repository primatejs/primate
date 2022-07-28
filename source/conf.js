import {Path, File} from "runtime-compat/filesystem";
import {Either} from "polyad";
import cache from "./cache.js";
import extend from "./extend_object.js";
import json from "./preset/primate.json" assert {type: "json"};

const qualify = (root, paths) =>
  Object.keys(paths).reduce((sofar, key) => {
    const value = paths[key];
    sofar[key] = typeof value === "string"
      ? Path.join(root, value)
      : qualify(`${root}/${key}`, value);
    return sofar;
  }, {});

export default (file = "primate.json") => cache("conf", file, () => {
  const root = Path.resolve();
  const conf = Either
    .try(() => extend(json, JSON.parse(File.read_sync(Path.join(root, file)))))
    .match({left: () => json})
    .get();
  const paths = qualify(root, conf.paths);

  return {...conf, paths, root};
});
