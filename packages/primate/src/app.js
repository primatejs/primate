import crypto from "runtime-compat/crypto";
import {tryreturn} from "runtime-compat/async";
import {File, Path} from "runtime-compat/fs";
import {bold, blue} from "runtime-compat/colors";
import {is} from "runtime-compat/dyndef";
import {transform, valmap} from "runtime-compat/object";
import errors from "./errors.js";
import {print} from "./Logger.js";
import dispatch$ from "./dispatch.js";
import toSorted from "./toSorted.js";
import * as handlers from "./handlers/exports.js";
import * as hooks from "./hooks/exports.js";
import * as loaders from "./loaders/exports.js";

const {DoubleFileExtension} = errors;

const base = new Path(import.meta.url).up(1);
// do not hard-depend on node
const packager = import.meta.runtime?.packager ?? "package.json";
const library = import.meta.runtime?.library ?? "node_modules";

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

export default async (log, root, config) => {
  const {http} = config;
  const secure = http?.ssl !== undefined;
  const {name, version} = await base.up(1).join(packager).json();
  const paths = valmap(config.paths, value => root.join(value));

  const at = `at http${secure ? "s" : ""}://${http.host}:${http.port}\n`;
  print(blue(bold(name)), blue(version), at);

  // if ssl activated, resolve key and cert early
  if (secure) {
    http.ssl.key = root.join(http.ssl.key);
    http.ssl.cert = root.join(http.ssl.cert);
  }

  const types = await loaders.types(log, paths.types);
  const error = await paths.routes.join("+error.js");
  const routes = await loaders.routes(log, paths.routes);
  const dispatch = dispatch$(types);
  const modules = await loaders.modules(log, root, config);

  const app = {
    build: {
      paths: {
        client: paths.build.join("client"),
        server: paths.build.join("server"),
        components: paths.build.join("components"),
        pages: paths.build.join("pages"),
      },
    },
    config,
    secure,
    name,
    version,
    importmaps: {},
    assets: [],
    exports: [],
    paths,
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
    dispatch,
    parse: hooks.parse(dispatch),
    modules,
    packager,
    library,
    async copy(source, target, filter = /^.*.js$/u) {
      const jss = await source.collect(filter);
      await Promise.all(jss.map(async js => {
        const file = await js.file.read();
        const to = await target.join(js.path.replace(source, ""));
        await to.directory.file.create();
        await to.file.write(file);
      }));
    },
    async transcopy(source, target = this.paths.build) {
      const {files, mapper} = this.config.build.transform;
      is(files).array();
      is(mapper).function();

      await Promise.all(source.map(async path => {
        const file = await path.file.read();
        const filename = `${path}`.replace(`${this.root}`, _ => "").slice(1);
        const contents = files.includes(filename) ? mapper(file) : file;
        const to = await target.join(filename);
        await to.directory.file.create();
        await to.file.write(contents);
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
    async render({body = "", head = "", page = config.pages.index} = {}) {
      const {assets, build} = this;

      const html = await index(build.paths.pages, page, config.pages.index);
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

      const heads = head.concat("\n", toSorted(assets,
        ({type}) => -1 * (type === "importmap"))
        .map(({src, code, type, inline, integrity}) =>
          type === "style"
            ? style({inline, code, href: src})
            : script({inline, code, type, integrity, src})
        ).join("\n"));
      // remove inline assets
      this.assets = assets.filter(({inline, type}) => !inline
        || type === "importmap");
      return html.replace("%body%", _ => body).replace("%head%", _ => heads);
    },
    async publish({src, code, type = "", inline = false, copy = true}) {
      if (!inline && copy) {
        const base = this.build.paths.client.join(src);
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
      const {http: {static: {root}}} = this.config;
      const parts = module.split("/");
      const path = [this.library, ...parts];
      const pkg = await Path.resolve().join(...path, this.packager).json();
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
      const to = new Path(this.build.paths.client, this.library, ...parts);
      await dependency.file.copy(to);
      this.importmaps = {
        ...valmap(exports, value => new Path(root, this.library, value).path),
        ...this.importmaps};
    },
  };

  return {...app, route: hooks.route(app)};
};
