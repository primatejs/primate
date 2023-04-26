import crypto from "runtime-compat/crypto";
import {is} from "runtime-compat/dyndef";
import {File, Path} from "runtime-compat/fs";
import extend from "./extend.js";
import defaults from "./defaults/primate.config.js";
import {colors, print, default as Logger} from "./Logger.js";
import * as handlers from "./handlers/exports.js";

const qualify = (root, paths) =>
  Object.keys(paths).reduce((sofar, key) => {
    const value = paths[key];
    sofar[key] = typeof value === "string"
      ? new Path(root, value)
      : qualify(`${root}/${key}`, value);
    return sofar;
  }, {});

const configName = "primate.config.js";

const getConfig = async (root, filename) => {
  const config = root.join(filename);
  if (await config.exists) {
    try {
      const imported = await import(config);
      if (imported.default === undefined) {
        print(`${colors.yellow("??")} ${configName} has no default export\n`);
      }
      return extend(defaults, imported.default);
    } catch (error) {
      print(`${colors.red("!!")} couldn't load config file\n`);
      throw error;
    }
  } else {
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

const src = new Path(import.meta.url).up(1);

const index = async app => {
  const name = "index.html";
  try {
    // user-provided file
    return await File.read(`${app.paths.static.join(name)}`);
  } catch (error) {
    // fallback
    return src.join("defaults", name).text();
  }
};

const hash = async (string, algorithm = "sha-384") => {
  const encoder = new TextEncoder();
  const bytes = await crypto.subtle.digest(algorithm, encoder.encode(string));
  const algo = algorithm.replace("-", () => "");
  return `${algo}-${btoa(String.fromCharCode(...new Uint8Array(bytes)))}`;
};

export default async (filename = configName) => {
  is(filename).string();
  const root = await getRoot();
  const config = await getConfig(root, filename);

  const {name, version} = await src.up(1).join("package.json").json();

  // if ssl activated, resolve key and cert early
  if (config.http.ssl) {
    config.http.ssl.key = root.join(config.http.ssl.key);
    config.http.ssl.cert = root.join(config.http.ssl.cert);
  }

  const paths = qualify(root, config.paths);

  const ending = ".js";
  const routes = await Promise.all(
    (await Path.collect(paths.routes, /^.*.js$/u))
      .map(async route => [
        `${route}`.replace(paths.routes, "").slice(1, -ending.length),
        (await import(route)).default,
      ]));

  const app = {
    config,
    routes,
    secure: config.http?.ssl !== undefined,
    name, version,
    library: {},
    identifiers: {},
    replace(code) {
      const joined = Object.keys(app.identifiers).join("|");
      const re = `(?<=import (?:.*) from ['|"])(${joined})(?=['|"])`;
      return code.replaceAll(new RegExp(re, "gus"), (_, p1) => {
        if (app.library[p1] === undefined) {
          app.library[p1] = app.identifiers[p1];
        }
        return app.identifiers[p1];
      });
    },
    resources: [],
    entrypoints: [],
    paths,
    root,
    log: new Logger(config.logger),
    handlers: {...handlers},
    render: async ({body = "", head = ""} = {}) => {
      const html = await index(app);
      const heads = app.resources.map(({src, code, type, inline, integrity}) => {
        const tag = type === "style" ? "link" : "script";
        const pre = type === "style"
          ? `<${tag} rel="stylesheet"`
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
    publish: async ({src, code, type = "", inline = false}) => {
      if (type === "module") {
        code = app.replace(code);
      }
      // while integrity is only really needed for scripts, it is also later
      // used for the etag header
      const integrity = await hash(code);
      const _src = new Path(config.http.static.root).join(src ?? "");
      app.resources.push({src: `${_src}`, code, type, inline, integrity});
      return integrity;
    },
    bootstrap: ({type, code}) => {
      app.entrypoints.push({type, code});
    },
    resolve: (pkg, name) => {
      const exports = Object.fromEntries(Object.entries(pkg.exports)
        .filter(([, _export]) => _export.import !== undefined)
        .map(([key, value]) => [
          key.replace(".", name),
          value.import.replace(".", `./${name}`),
        ]));
      app.identifiers = {...exports, ...app.identifiers};
    },
    modules: [...config.modules],
  };
  print(colors.blue(colors.bold(name)), colors.blue(version), "");
  const type = app.secure ? "https" : "http";
  const address = `${type}://${config.http.host}:${config.http.port}`;
  print(colors.gray(`at ${address}`), "\n");
  // modules may load other modules
  await Promise.all(app.modules
    .filter(module => module.load !== undefined)
    .map(module => module.load({...app, load(dependent) {
      app.modules.push(dependent);
    }})));

  return app;
};
