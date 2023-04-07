import {Path} from "runtime-compat/fs";
import {is} from "runtime-compat/dyndef";
import cache from "./cache.js";
import extend from "./extend.js";
import defaults from "./primate.config.js";
import * as log from "./log.js";
import * as handlers from "./handlers/exports.js";
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

const getRoot = async () => {
  try {
    // use module root if possible
    return await Path.root();
  } catch (error) {
    // fall back to current directory
    return Path.resolve();
  }
};

export default async (filename = "primate.config.js") => {
  is(filename).string();
  const root = await getRoot();
  const config = await getConfig(root, filename);

  const env = {
    ...config,
    paths: qualify(root, config.paths),
    root,
    log: {...log, error: error => log.error(error, config)},
    register: (name, handler) => {
      env.handlers[name] = handler;
    },
    handlers: {...handlers},
  };
  env.log.info(`${package_json.name} \x1b[34m${package_json.version}\x1b[0m`);
  const modules = await Promise.all(config.modules.map(module => module(env)));
  // modules may load other modules
  const loads = await Promise.all(modules
    .filter(module => module.load !== undefined)
    .map(module => module.load()(env)));

  return cache("config", filename, () => ({...env,
    modules: modules.concat(loads)}));
};
