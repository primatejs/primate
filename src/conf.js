import {Path} from "runtime-compat/filesystem";
import {Either} from "runtime-compat/functional";
import cache from "./cache.js";
import extend from "./extend.js";
import json from "./preset/primate.json" assert {type: "json"};

const qualify = (root, paths) =>
  Object.keys(paths).reduce((sofar, key) => {
    const value = paths[key];
    sofar[key] = typeof value === "string"
      ? new Path(root, value)
      : qualify(`${root}/${key}`, value);
    return sofar;
  }, {});

export default (filename = "primate.json") => cache("conf", filename, () => {
  const root = Path.resolve();
  const conf = Either
    .try(() => extend(json, JSON.parse(root.join(filename).file.readSync())))
    .match({left: () => json})
    .get();
  const paths = qualify(root, conf.paths);

  return {...conf, paths, root};
});
