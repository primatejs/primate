import {join, resolve} from "path";
import cache from "./cache.js";
import File from "./File.js";
import extend_object from "./extend_object.js";
import primate_json from "./preset/primate.json" assert {"type": "json" };

const qualify = (root, paths) =>
  Object.keys(paths).reduce((sofar, key) => {
    const value = paths[key];
    sofar[key] = typeof value === "string"
      ? join(root, value)
      : qualify(`${root}/${key}`, value);
    return sofar;
  }, {});

export default (file = "primate.json") => cache("conf", file, () => {
  let conf = primate_json;
  const root = resolve();
  try {
    conf = extend_object(conf, JSON.parse(File.read_sync(join(root, file))));
  } catch (error) {
    // local primate.json not required
  }
  conf.paths = qualify(root, conf.paths);
  conf.root = root;
  return conf;
});
