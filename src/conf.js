import {Path} from "runtime-compat/filesystem";
import cache from "./cache.js";
import extend from "./extend.js";
import preset from "./preset/primate.conf.js";
import * as log from "./log.js";
import package_json from "../package.json" assert {type: "json"};

const qualify = (root, paths) =>
  Object.keys(paths).reduce((sofar, key) => {
    const value = paths[key];
    sofar[key] = typeof value === "string"
      ? new Path(root, value)
      : qualify(`${root}/${key}`, value);
    return sofar;
  }, {});

const getConf = async (root, filename) => {
  try {
    return extend(preset, (await import(root.join(filename))).default);
  } catch (error) {
    // this happens before we've initialised conf, so show full stack trace
    log.error(error, {debug: true});
    return preset;
  }
};

export default async (filename = "primate.conf.js") => {
  const root = Path.resolve();
  const conf = await getConf(root, filename);

  const env = {
    ...conf,
    paths: qualify(root, conf.paths),
    root,
    log: {...log, error: error => log.error(error, conf),
    },
  };
  env.log.info(`${package_json.name} \x1b[34m${package_json.version}\x1b[0m`);
  const modules = await Promise.all(conf.modules.map(module => module(env)));
  return cache("conf", filename, () => ({...env, modules}));
};
