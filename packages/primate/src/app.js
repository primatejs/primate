import crypto from "rcompat/crypto";
import { tryreturn } from "rcompat/async";
import FS from "rcompat/fs";
import { is } from "rcompat/invariant";
import o from "rcompat/object";
import { globify } from "rcompat/string";
import * as runtime from "rcompat/meta";
import { identity } from "rcompat/function";
import { Response, Status, MediaType } from "rcompat/http";

import errors from "./errors.js";
import to_sorted from "./to_sorted.js";
import * as handlers from "./handlers.js";
import * as loaders from "./loaders/exports.js";

const { DoubleFileExtension } = errors;

const to_csp = (config_csp, assets, csp) => config_csp
  // only csp entries in the config will be enriched
  .map(([key, directives]) =>
    // enrich with application assets
    [key, assets[key] ? directives.concat(...assets[key]) : directives])
  .map(([key, directives]) =>
    // enrich with explicit csp
    [key, csp[key] ? directives.concat(...csp[key]) : directives])
  .map(([key, directives]) => `${key} ${directives.join(" ")}`)
  .join(";");

// use user-provided file or fall back to default
const load = (base, page, fallback) =>
  tryreturn(_ => FS.File.text(`${base.join(page)}`))
    .orelse(_ => FS.File.text(`${base.join(fallback)}`));

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

const render_head = (assets, head) =>
  to_sorted(assets, ({ type }) => -1 * (type === "importmap"))
    .map(({ src, code, type, inline, integrity }) =>
      type === "style"
        ? tags.style({ inline, code, href: src })
        : tags.script({ inline, code, type, integrity, src }),
    ).join("\n").concat("\n", head ?? "");

export default async (log, root, config) => {
  const { http } = config;
  const secure = http?.ssl !== undefined;
  const path = o.valmap(config.location, value => root.join(value));

  // if ssl activated, resolve key and cert early
  if (secure) {
    http.ssl.key = root.join(http.ssl.key);
    http.ssl.cert = root.join(http.ssl.cert);
  }

  const error = await path.routes.join("+error.js");

  return {
    secure,
    importmaps: {},
    assets: [],
    path,
    root,
    log,
    // pseudostatic thus arrowbound
    get: (config_key, fallback) => o.get(config, config_key) ?? fallback,
    error: {
      default: await error.exists() ? await error.import("default") : undefined,
    },
    handlers: { ...handlers },
    extensions: {
      ".html": {
        handle: handlers.html,
      },
    },
    modules: await loaders.modules(log, root, config.modules ?? []),
    ...runtime,
    // copy files to build folder, potentially transforming them
    async stage(source, directory, filter) {
      const { paths = [], mapper = identity } = this.get("build.transform", {});
      is(paths).array();
      is(mapper).function();

      const regexs = paths.map(file => globify(file));
      const target_base = this.runpath(directory);

      await source.copy(target_base);

      await Promise.all((await source.collect(filter)).map(async path => {
        const debased = path.debase(this.root).path.slice(1);
        const filename = FS.File.join(directory, path.debase(source));
        const target = await target_base.join(filename.debase(directory));
        await target.directory.create();
        regexs.some(regex => regex.test(debased))
          && target.write(mapper(await path.text()));
      }));
    },
    async compile(component) {
      const { server, client, components } = this.get("location");

      const source = this.path.components;
      const compile = this.extensions[component.fullExtension]?.compile
        ?? this.extensions[component.extension]?.compile;
      if (compile === undefined) {
        const debased = `${component.path}`.replace(source, "");

        const server_target = this.runpath(server, components, debased);
        await server_target.directory.create();
        await component.copy(server_target);

        const client_target = this.runpath(client, components, debased);
        await client_target.directory.create();
        await component.copy(client_target);
      } else {
        // compile server components
        await compile.server(component);

        // compile client components
        await compile.client(component);
      }
    },
    headers(csp = {}) {
      const http_csp = Object.entries(this.get("http.csp", {}));

      return {
        ...this.get("http.headers", {}),
        ...http_csp.length === 0 ? {} : {
          "Content-Security-Policy": to_csp(http_csp, this.asset_csp, csp),
        },
      };
    },
    runpath(...directories) {
      return this.path.build.join(...directories);
    },
    async render(content) {
      const index = this.get("pages.index");
      const { body, head, partial, placeholders = {}, page = index } = content;
      ["body", "head"].every(used => is(placeholders[used]).undefined());

      return partial ? body : Object.entries(placeholders)
        // replace given placeholders, defaulting to ""
        .reduce((html, [key, value]) => html.replace(`%${key}%`, value ?? ""),
          await load(this.runpath(this.get("location.pages")), page, index))
        // replace non-given placeholders, aside from %body% / %head%
        .replaceAll(/(?<keep>%(?:head|body)%)|%.*?%/gus, "$1")
        // replace body and head
        .replace("%body%", body)
        .replace("%head%", render_head(this.assets, head));
    },
    respond(body, { status = Status.OK, headers = {} } = {}) {
      return new Response(body, { status, headers: {
        "Content-Type": MediaType.TEXT_HTML, ...this.headers(), ...headers },
      });
    },
    async view(options) {
      // split render and respond options
      const { status, headers, ...rest } = options;
      return this.respond(await this.render(rest), { status, headers });
    },
    media(type, { status, headers } = {}) {
      return { status, headers: { ...headers, "Content-Type": type } };
    },
    async inline(code, type) {
      const integrity = await this.hash(code);
      const tag_name = type === "style" ? "style" : "script";
      const head = tags[tag_name]({ code, type, inline: true, integrity });
      return { head, integrity: `'${integrity}'` };
    },
    async publish({ src, code, type = "", inline = false }) {
      if (inline || type === "style") {
        this.assets.push({
          src: FS.File.join(http.static.root, src ?? "").path,
          code: inline ? code : "",
          type,
          inline,
          integrity: await this.hash(code),
        });
      }
      // rehash assets_csp
      this.asset_csp = this.assets.map(({ type: directive, integrity }) => [
        `${directive === "style" ? "style" : "script"}-src`, integrity])
        .reduce((csp, [directive, hash]) =>
          ({ ...csp, [directive]: csp[directive].concat(`'${hash}'`) } ),
          { "style-src": [], "script-src": [] },
        );
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
  };
};
