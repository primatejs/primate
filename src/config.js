import crypto from "runtime-compat/crypto";
import {is} from "runtime-compat/dyndef";
import {File, Path} from "runtime-compat/fs";
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

const index = async env => {
  const name = "index.html";
  try {
    // user-provided file
    return await File.read(`${env.paths.static.join(name)}`);
  } catch (error) {
    // fallback
    return new Path(import.meta.url).directory.join(name).file.read();
  }
};

const hash = async (string, algorithm = "sha-384") => {
  const encoder = new TextEncoder();
  const bytes = await crypto.subtle.digest(algorithm, encoder.encode(string));
  const algo = algorithm.replace("-", () => "");
  return `${algo}-${btoa(String.fromCharCode(...new Uint8Array(bytes)))}`;
};

export default async (filename = "primate.config.js") => {
  is(filename).string();
  const root = await getRoot();
  const config = await getConfig(root, filename);

  const env = {
    ...config,
    resources: [],
    entrypoints: [],
    paths: qualify(root, config.paths),
    root,
    log: {...log, error: error => log.error(error, config)},
    register: (name, handler) => {
      env.handlers[name] = handler;
    },
    handlers: {...handlers},
    render: async ({body = "", head = ""} = {}) => {
      const html = await index(env);
      const heads = env.resources.map(({src, code, type, inline, integrity}) => {
        const tag = type === "style" ? "link" : "script";
        const pre = type === "style"
          ? `<${tag} rel="stylesheet" integrity="${integrity}"`
          : `<${tag} type="${type}" integrity="${integrity}"`;
        const middle = type === "style"
          ? ` href="${src}">`
          : ` src="${src}">`;
        const post = type === "style" ? "" : `</${tag}>`;
        return inline ? `${pre}>${code}${post}` : `${pre}${middle}${post}`;
      }).join("\n");
      return html
        .replace("%body%", () => body)
        .replace("%head%", () => `${head}${heads}`);
    },
    publish: async ({src, code, type = "", inline = false, main}) => {
      const integrity = await hash(code);
      env.resources.push({src, code, type, inline, integrity, main});
      return integrity;
    },
    bootstrap: ({type, code}) => {
      env.entrypoints.push({type, code});
    },
  };
  env.log.info(`${package_json.name} \x1b[34m${package_json.version}\x1b[0m`);
  const {modules} = config;
  // modules may load other modules
  const loads = await Promise.all(modules
    .filter(module => module.load !== undefined)
    .map(module => module.load()));

  return cache("config", filename, () => ({...env,
    modules: modules.concat(loads.flat())}));
};
