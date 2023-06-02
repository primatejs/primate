import crypto from "runtime-compat/crypto";
import {File, Path} from "runtime-compat/fs";
import {bold, blue} from "runtime-compat/colors";
import * as handlers from "./handlers/exports.js";
import * as hooks from "./hooks/exports.js";
import * as loaders from "./loaders/exports.js";
import dispatch from "./dispatch.js";
import {print} from "./Logger.js";

const base = new Path(import.meta.url).up(1);

const index = async (app, layout) => {
  const name = layout;
  try {
    // user-provided file
    return await File.read(`${app.paths.layouts.join(name)}`);
  } catch (error) {
    // fallback
    return base.join("defaults", app.config.layout).text();
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
  const secure = http?.ssl !== undefined;
  const {name, version} = await base.up(1).join("package.json").json();
  const paths = Object.fromEntries(Object.entries(config.paths)
    .map(([key, value]) => [key, root.join(value)]));

  const at = `at http${secure ? "s" : ""}://${http.host}:${http.port}\n`;
  print(blue(bold(name)), blue(version), at);

  // if ssl activated, resolve key and cert early
  if (secure) {
    http.ssl.key = root.join(http.ssl.key);
    http.ssl.cert = root.join(http.ssl.cert);
  }

  const app = {
    config,
    secure,
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
      app.resources = app.resources.filter(resource => !resource.inline);

      return {
        "Content-Security-Policy": _csp,
        "Referrer-Policy": "same-origin",
      };
    },
    handlers: {...handlers},
    render: async ({body = "", head = "", layout} = {}) => {
      const html = await index(app, layout ?? config.layout);
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
    types: await loaders.types(log, paths.types),
    guards: await loaders.guards(log, paths.guards),
    routes: await loaders.routes(log, paths.routes),
  };

  const modules = await loaders.modules(app, root, config);

  return {...app,
    modules,
    route: hooks.route({...app, modules, dispatch: dispatch(app.types)}),
    parse: hooks.parse(dispatch(app.types)),
  };
};
