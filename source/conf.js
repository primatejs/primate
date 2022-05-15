import {Path, File} from "runtime-compat/filesystem";
import cache from "./cache.js";
import extend_object from "./extend_object.js";
import primate_json from "./preset/primate.json" assert {"type": "json" };

const qualify = (root, paths) =>
  Object.keys(paths).reduce((sofar, key) => {
    const value = paths[key];
    sofar[key] = typeof value === "string"
      ? Path.join(root, value)
      : qualify(`${root}/${key}`, value);
    return sofar;
  }, {});

export default (file = "primate.json") => cache("conf", file, () => {
  let conf = primate_json;
  const root = Path.resolve();
  try {
    conf = extend_object(conf, JSON.parse(File.read_sync(Path.join(root, file))));
  } catch (error) {
    // local primate.json not required
  }
  conf.paths = qualify(root, conf.paths);
  conf.root = root;
  return conf;
});
