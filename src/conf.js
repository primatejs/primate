import {Path} from "runtime-compat/filesystem";
import {EagerEither} from "runtime-compat/functional";
import cache from "./cache.js";
import extend from "./extend.js";
import preset from "./preset/primate.conf.js";
import log from "./log.js";
import package_json from "../package.json" assert {type: "json"};

const qualify = (root, paths) =>
  Object.keys(paths).reduce((sofar, key) => {
    const value = paths[key];
    sofar[key] = typeof value === "string"
      ? new Path(root, value)
      : qualify(`${root}/${key}`, value);
    return sofar;
  }, {});

export default async (filename = "primate.conf.js") => {
  const root = Path.resolve();
  const conffile = root.join(filename);
  const conf = await EagerEither
    .try(async () => extend(preset, (await import(conffile)).default))
    .match({left: () => preset})
    .get();

  const temp = {...conf, ...log, paths: qualify(root, conf.paths), root};
  temp.info(`primate \x1b[34m${package_json.version}\x1b[0m`);
  const modules = await Promise.all(conf.modules.map(module => module(temp)));
  return cache("conf", filename, () => ({...temp, modules}));
};
