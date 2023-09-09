import crypto from "runtime-compat/crypto";
import {tryreturn} from "runtime-compat/async";
import {File, Path} from "runtime-compat/fs";
import {bold, blue} from "runtime-compat/colors";
import {is} from "runtime-compat/dyndef";
import {transform, valmap, to} from "runtime-compat/object";
import {globify} from "runtime-compat/string";
import * as runtime from "runtime-compat/meta";

import errors from "./errors.js";
import {print} from "./Logger.js";
import dispatch from "./dispatch.js";
import to_sorted from "./to_sorted.js";
import * as handlers from "./handlers/exports.js";
import * as loaders from "./loaders/exports.js";

const {DoubleFileExtension} = errors;

// use user-provided file or fall back to default
const index = (base, page, fallback) =>
  tryreturn(_ => File.read(`${base.join(page)}`))
    .orelse(_ => File.read(`${base.join(fallback)}`));

const encoder = new TextEncoder();

const attribute = attributes => Object.keys(attributes).length > 0
  ? " ".concat(Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`).join(" "))
  : "";
const tag = ({name, attributes = {}, code = "", close = true}) =>
  `<${name}${attribute(attributes)}${close ? `>${code}</${name}>` : "/>"}`;

const {name, version} = await new Path(import.meta.url).up(2)
  .join(runtime.manifest).json();

export default async (log, root, config) => {
  const {http} = config;
  const secure = http?.ssl !== undefined;
  const path = valmap(config.location, value => root.join(value));

  const at = `at http${secure ? "s" : ""}://${http.host}:${http.port}\n`;
  print(blue(bold(name)), blue(version), at);

  // if ssl activated, resolve key and cert early
  if (secure) {
    http.ssl.key = root.join(http.ssl.key);
    http.ssl.cert = root.join(http.ssl.cert);
  }

  const types = await loaders.types(log, path.types);
  const error = await path.routes.join("+error.js");
  const routes = await loaders.routes(log, path.routes);

  return {
    config,
    secure,
    name,
    version,
    importmaps: {},
    assets: [],
    exports: [],
    path,
    root,
    log,
    error: {
      default: await error.exists ? (await import(error)).default : undefined,
    },
    handlers: {...handlers},
    types,
    routes,
    layout: {
      depth: Math.max(...routes.map(({layouts}) => layouts.length)) + 1,
    },
    dispatch: dispatch(types),
    modules: await loaders.modules(log, root, config),
    ...runtime,
    // copy files to build folder, potentially transforming them
    async stage(source, directory, filter) {
      const {paths, mapper} = this.config.build.transform;
      is(paths).array();
      is(mapper).function();

      const regexs = paths.map(file => globify(file));
      const target = this.runpath(directory);

      await Promise.all((await source.collect(filter)).map(async path => {
        const debased = path.debase(this.root).path.slice(1);
        const filename = new Path(directory).join(path.debase(source));
        const to = await target.join(filename.debase(directory));
        await to.directory.file.create();
        if (regexs.some(regex => regex.test(debased))) {
          const contents = mapper(await path.text());
          await to.file.write(contents);
        } else {
          await path.file.copy(to);
        }
      }));
    },
    headers() {
      const csp = Object.keys(http.csp).reduce((policy, key) =>
        `${policy}${key} ${http.csp[key]};`, "")
        .replace("script-src 'self'", `script-src 'self' ${
          this.assets
            .filter(({type}) => type !== "style")
            .map(asset => `'${asset.integrity}'`).join(" ")
        } `)
        .replace("style-src 'self'", `style-src 'self' ${
          this.assets
            .filter(({type}) => type === "style")
            .map(asset => `'${asset.integrity}'`).join(" ")
        } `);

      return {
        "Content-Security-Policy": csp,
        "Referrer-Policy": "same-origin",
      };
    },
    runpath(...directories) {
      return this.path.build.join(...directories);
    },
    async render({body = "", head = "", page = config.pages.index} = {}) {
      const {location: {pages}} = this.config;

      const html = await index(this.runpath(pages), page, config.pages.index);
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

      const heads = head.concat("\n", to_sorted(this.assets,
        ({type}) => -1 * (type === "importmap"))
        .map(({src, code, type, inline, integrity}) =>
          type === "style"
            ? style({inline, code, href: src})
            : script({inline, code, type, integrity, src})
        ).join("\n"));
      // remove inline assets
      this.assets = this.assets.filter(({inline, type}) => !inline
        || type === "importmap");
      return html.replace("%body%", _ => body).replace("%head%", _ => heads);
    },
    async publish({src, code, type = "", inline = false, copy = true}) {
      if (!inline && copy) {
        const base = this.runpath(this.config.location.client).join(src);
        await base.directory.file.create();
        await base.file.write(code);
      }
      if (inline || type === "style") {
        this.assets.push({
          src: new Path(http.static.root).join(src ?? "").path,
          code: inline ? code : "",
          type,
          inline,
          integrity: await this.hash(code),
        });
      }
    },
    export({type, code}) {
      this.exports.push({type, code});
    },
    register(extension, handler) {
      is(this.handlers[extension]).undefined(DoubleFileExtension.new(extension));
      this.handlers[extension] = handler;
    },
    async hash(data, algorithm = "sha-384") {
      const bytes = await crypto.subtle.digest(algorithm, encoder.encode(data));
      const prefix = algorithm.replace("-", _ => "");
      return `${prefix}-${btoa(String.fromCharCode(...new Uint8Array(bytes)))}`;
    },
    async import(module) {
      const {http: {static: {root}}, location: {client}} = this.config;

      const parts = module.split("/");
      const path = [this.library, ...parts];
      const pkg = await Path.resolve().join(...path, this.manifest).json();
      const exports = pkg.exports === undefined
        ? {[module]: `/${module}/${pkg.main}`}
        : transform(pkg.exports, entry => entry
          .filter(([, export$]) => export$.browser?.default !== undefined
            || export$.import !== undefined
            || export$.default !== undefined)
          .map(([key, value]) => [
            key.replace(".", module),
            value.browser?.default.replace(".", `./${module}`)
              ?? value.default?.replace(".", `./${module}`)
              ?? value.import?.replace(".", `./${module}`),
          ]));
      const dependency = Path.resolve().join(...path);
      const to = new Path(this.runpath(client), this.library, ...parts);
      await dependency.file.copy(to);
      this.importmaps = {
        ...valmap(exports, value => new Path(root, this.library, value).path),
        ...this.importmaps};
    },
  };
};
