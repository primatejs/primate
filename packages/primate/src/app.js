import crypto from "rcompat/crypto";
import { tryreturn } from "rcompat/async";
import { Path } from "rcompat/fs";
import { is } from "rcompat/invariant";
import { transform, valmap } from "rcompat/object";
import { globify } from "rcompat/string";
import * as runtime from "rcompat/meta";

import errors from "./errors.js";
import to_sorted from "./to_sorted.js";
import * as handlers from "./handlers/exports.js";
import * as loaders from "./loaders/exports.js";

const { DoubleFileExtension } = errors;

// use user-provided file or fall back to default
const index = (base, page, fallback) =>
  tryreturn(_ => Path.read(`${base.join(page)}`))
    .orelse(_ => Path.read(`${base.join(fallback)}`));

const encoder = new TextEncoder();

const attribute = attributes => Object.keys(attributes).length > 0
  ? " ".concat(Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`).join(" "))
  : "";
const tag = ({ name, attributes = {}, code = "", close = true }) =>
  `<${name}${attribute(attributes)}${close ? `>${code}</${name}>` : "/>"}`;
const tags = {
  // inline: <script type integrity>...</script>
  // outline: <script type integrity src></script>
  script({ inline, code, type, integrity, src }) {
    return inline
      ? tag({ name: "script", attributes: { type, integrity }, code })
      : tag({ name: "script", attributes: { type, integrity, src } });
  },
  // inline: <style>...</style>
  // outline: <link rel="stylesheet" href/>
  style({ inline, code, href, rel = "stylesheet" }) {
    return inline
      ? tag({ name: "style", code })
      : tag({ name: "link", attributes: { rel, href }, close: false });
  },
};

const { name, version } = await new Path(import.meta.url).up(2)
  .join(runtime.manifest).json();

export default async (log, root, config) => {
  const { http } = config;
  const secure = http?.ssl !== undefined;
  const path = valmap(config.location, value => root.join(value));

  // if ssl activated, resolve key and cert early
  if (secure) {
    http.ssl.key = root.join(http.ssl.key);
    http.ssl.cert = root.join(http.ssl.cert);
  }

  const error = await path.routes.join("+error.js");

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
      default: await error.exists() ? (await import(error)).default : undefined,
    },
    handlers: { ...handlers },
    extensions: {},
    modules: await loaders.modules(log, root, config),
    ...runtime,
    // copy files to build folder, potentially transforming them
    async stage(source, directory, filter) {
      const { paths, mapper } = this.config.build.transform;
      is(paths).array();
      is(mapper).function();

      const regexs = paths.map(file => globify(file));
      const target_base = this.runpath(directory);

      await Promise.all((await source.collect(filter)).map(async path => {
        const debased = path.debase(this.root).path.slice(1);
        const filename = new Path(directory).join(path.debase(source));
        const target = await target_base.join(filename.debase(directory));
        await target.directory.create();
        await (regexs.some(regex => regex.test(debased))
          ? target.write(mapper(await path.text()))
          : path.copy(target));
      }));
    },
    async compile(component) {
      const { location: { server, client, components } } = this.config;

      const source = this.path.components;
      const compile = this.extensions[component.extension]?.compile;
      if (compile === undefined) {
        const debased = `${component.path}`.replace(source, "");

        const server_target = this.runpath(server, components);
        await component.copy(server_target.join(debased));

        const client_target = this.runpath(client, components);
        await component.copy(client_target.join(debased));
      } else {
        // compile server components
        await compile.server(component);

        // compile client components
        await compile.client(component);
      }
    },
    headers({ script = "", style = "" } = {}) {
      const csp = Object.keys(http.csp).reduce((policy, key) =>
        `${policy}${key} ${http.csp[key]};`, "")
        .replace("script-src 'self'", `script-src 'self' ${script} ${
          this.assets
            .filter(({ type }) => type !== "style")
            .map(asset => `'${asset.integrity}'`).join(" ")
        }`)
        .replace("style-src 'self'", `style-src 'self' ${style} ${
          this.assets
            .filter(({ type }) => type === "style")
            .map(asset => `'${asset.integrity}'`).join(" ")
        }`);

      return { "Content-Security-Policy": csp, "Referrer-Policy": "same-origin" };
    },
    runpath(...directories) {
      return this.path.build.join(...directories);
    },
    async render({ body = "", head = "", page = config.pages.index } = {}) {
      const { location: { pages } } = this.config;

      const html = await index(this.runpath(pages), page, config.pages.index);

      const heads = to_sorted(this.assets,
        ({ type }) => -1 * (type === "importmap"))
        .map(({ src, code, type, inline, integrity }) =>
          type === "style"
            ? tags.style({ inline, code, href: src })
            : tags.script({ inline, code, type, integrity, src }),
        ).join("\n").concat("\n", head);
      return html.replace("%body%", _ => body).replace("%head%", _ => heads);
    },
    async inline(code, type) {
      const integrity = await this.hash(code);
      const tag_name = type === "style" ? "style" : "script";
      const head = tags[tag_name]({ code, type, inline: true, integrity });
      return { head, csp: `'${integrity}'` };
    },
    async publish({ src, code, type = "", inline = false, copy = true }) {
      if (!inline && copy) {
        const base = this.runpath(this.config.location.client).join(src);
        await base.directory.create();
        await base.write(code);
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
    export({ type, code }) {
      this.exports.push({ type, code });
    },
    register(extension, operations) {
      is(this.handlers[extension]).undefined(DoubleFileExtension.new(extension));
      this.handlers[extension] = operations.handle;
      this.extensions[extension] = operations;
    },
    async hash(data, algorithm = "sha-384") {
      const bytes = await crypto.subtle.digest(algorithm, encoder.encode(data));
      const prefix = algorithm.replace("-", _ => "");
      return `${prefix}-${btoa(String.fromCharCode(...new Uint8Array(bytes)))}`;
    },
    async import(module, deep_import) {
      const { http: { static: { root } }, location: { client } } = this.config;

      const parts = module.split("/");
      const path = [this.library, ...parts];
      const pkg = await Path.resolve().join(...path, this.manifest).json();
      const exports = pkg.exports === undefined
        ? { [module]: `/${module}/${pkg.main}` }
        : transform(pkg.exports, entry => entry
          .filter(([, export$]) =>
            export$.browser?.[deep_import] !== undefined
            || export$.browser?.default !== undefined
            || export$.import !== undefined
            || export$.default !== undefined)
          .map(([key, value]) => [
            key.replace(".", deep_import === undefined
              ? module : `${module}/${deep_import}`),
            value.browser?.[deep_import]?.replace(".", `./${module}`)
              ?? value.browser?.default.replace(".", `./${module}`)
              ?? value.default?.replace(".", `./${module}`)
              ?? value.import?.replace(".", `./${module}`),
          ]));
      const dependency = Path.resolve().join(...path);
      const target = new Path(this.runpath(client), this.library, ...parts);
      await dependency.copy(target);
      this.importmaps = {
        ...valmap(exports, value => new Path(root, this.library, value).path),
        ...this.importmaps };
    },
  };
};
