import crypto from "runtime-compat/crypto";
import {File, Path} from "runtime-compat/fs";
import {bold, blue} from "runtime-compat/colors";
import errors from "./errors.js";
import * as handlers from "./handlers/exports.js";
import * as hooks from "./hooks/exports.js";

const qualify = (root, paths) =>
  Object.keys(paths).reduce((sofar, key) => {
    const value = paths[key];
    sofar[key] = typeof value === "string"
      ? new Path(root, value)
      : qualify(`${root}/${key}`, value);
    return sofar;
  }, {});

const base = new Path(import.meta.url).up(1);
const defaultLayout = "index.html";

const index = async (app, layout = defaultLayout) => {
  const name = layout;
  try {
    // user-provided file
    return await File.read(`${app.paths.layouts.join(name)}`);
  } catch (error) {
    // fallback
    return base.join("defaults", defaultLayout).text();
  }
};

const hash = async (string, algorithm = "sha-384") => {
  const encoder = new TextEncoder();
  const bytes = await crypto.subtle.digest(algorithm, encoder.encode(string));
  const algo = algorithm.replace("-", () => "");
  return `${algo}-${btoa(String.fromCharCode(...new Uint8Array(bytes)))}`;
};

const attribute = attributes => Object.keys(attributes).length > 0 ?
  " ".concat(Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`).join(" "))
  : "";
const tag = ({name, attributes = {}, code = "", close = true}) =>
  `<${name}${attribute(attributes)}${close ? `>${code}</${name}>` : "/>"}`;

export default async (config, root, log) => {
  const {http} = config;

  // if ssl activated, resolve key and cert early
  if (http.ssl) {
    http.ssl.key = root.join(http.ssl.key);
    http.ssl.cert = root.join(http.ssl.cert);
  }

  const paths = qualify(root, config.paths);

  const ending = ".js";
  const routes = paths.routes === undefined ? [] : await Promise.all(
    (await Path.collect(paths.routes, /^.*.js$/u))
      .map(async route => [
        `${route}`.replace(paths.routes, "").slice(1, -ending.length),
        (await import(route)).default,
      ]));
  const types = Object.fromEntries(
    paths.types === undefined ? [] : await Promise.all(
      (await Path.collect(paths.types , /^.*.js$/u))
        .map(async type => [
          `${type}`.replace(paths.types, "").slice(1, -ending.length),
          (await import(type)).default,
        ])));

  const modules = config.modules === undefined ? [] : config.modules;

  modules.every((module, n) => module.name !== undefined ||
    errors.ModulesMustHaveNames.throw({n}));

  new Set(modules.map(({name}) => name)).size !== modules.length &&
    errors.DoubleModule.throw({
      modules: modules.map(({name}) => name),
      config: root.join("primate.config.js"),
    });

  const hookless = modules.filter(module =>
    !Object.keys(module).some(key => Object.keys(hooks).includes(key)));
  hookless.length > 0 && errors.ModuleHasNoHooks.warn(log, {hookless});

  const {name, version} = await base.up(1).join("package.json").json();

  const app = {
    config,
    routes,
    secure: http?.ssl !== undefined,
    name,
    version,
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
    log,
    generateHeaders: () => {
      const csp = Object.keys(http.csp).reduce((policy_string, key) =>
        `${policy_string}${key} ${http.csp[key]};`, "");
      const scripts = app.resources
        .filter(({type}) => type !== "style")
        .map(resource => `'${resource.integrity}'`).join(" ");
      const _csp = scripts === "" ? csp : `${csp}script-src 'self' ${scripts};`;
      // remove inline resources
      for (let i = app.resources.length - 1; i >= 0; i--) {
        const resource = app.resources[i];
        if (resource.inline) {
          app.resources.splice(i, 1);
        }
      }

      return {
        "Content-Security-Policy": _csp,
        "Referrer-Policy": "same-origin",
      };
    },
    handlers: {...handlers},
    render: async ({body = "", head = "", layout} = {}) => {
      const html = await index(app, layout);
      // inline: <script type integrity>...</script>
      // outline: <script type integrity src></script>
      const script = ({inline, code, type, integrity, src}) => inline
        ? tag({name: "script", attributes: {type, integrity}, code})
        : tag({name: "script", attributes: {type, integrity, src}});
      // inline: <style>...</style>
      // outline: <link rel="stylesheet" href/>
      const style = ({inline, code, href, rel = "stylesheet"}) => inline
        ? tag({name: "style", code})
        : tag({name: "link", attributes: {rel, href}, close: false});
      const heads = app.resources.map(({src, code, type, inline, integrity}) =>
        type === "style"
          ? style({inline, code, href: src})
          : script({inline, code, type, integrity, src})
      ).join("\n");
      return html
        .replace("%body%", () => body)
        .replace("%head%", () => `${head}${heads}`);
    },
    publish: async ({src, code, type = "", inline = false}) => {
      if (type === "module") {
        code = app.replace(code);
      }
      const integrity = await hash(code);
      const _src = new Path(http.static.root).join(src ?? "");
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
    modules,
    types,
  };
  log.class.print(blue(bold(name)), blue(version),
    `at http${app.secure ? "s" : ""}://${http.host}:${http.port}\n`);
  // modules may load other modules
  await Promise.all(app.modules
    .filter(module => module.load !== undefined)
    .map(module => module.load({...app, load(dependent) {
      app.modules.push(dependent);
    }})));

  app.route = hooks.route(app);
  app.parse = hooks.parse;

  return app;
};
