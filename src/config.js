import {Path} from "runtime-compat/fs";
import {is} from "runtime-compat/dyndef";
import cache from "./cache.js";
import extend from "./extend.js";
import defaults from "./primate.config.js";
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

const getConfig = async (root, filename) => {
  try {
    return extend(defaults, (await import(root.join(filename))).default);
  } catch (error) {
    return defaults;
  }
};

export default async (filename = "primate.config.js") => {
  is(filename).string();
  const root = Path.resolve();
  const config = await getConfig(root, filename);

  const env = {
    ...config,
    paths: qualify(root, config.paths),
    root,
    log: {...log, error: error => log.error(error, config),
    },
  };
  env.log.info(`${package_json.name} \x1b[34m${package_json.version}\x1b[0m`);
  const modules = await Promise.all(config.modules.map(module => module(env)));
  return cache("config", filename, () => ({...env, modules}));
};
