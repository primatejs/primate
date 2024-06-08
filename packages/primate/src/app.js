import { tryreturn } from "rcompat/async";
import crypto from "rcompat/crypto";
import { File } from "rcompat/fs";
import { identity } from "rcompat/function";
import { MediaType, Status } from "rcompat/http";
import { is } from "rcompat/invariant";
import * as O from "rcompat/object";
import { globify } from "rcompat/string";
import errors from "./errors.js";
import * as handlers from "./handlers.js";
import * as loaders from "./loaders/exports.js";
import to_sorted from "./to_sorted.js";

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
  tryreturn(_ => File.text(`${base.join(page)}`))
    .orelse(_ => File.text(`${base.join(fallback)}`));

const encoder = new TextEncoder();

const attribute = attributes => O.empty(attributes)
  ? ""
  : " ".concat(Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`).join(" "))
  ;
const tag = (name, { attributes = {}, code = "", close = true }) =>
  `<${name}${attribute(attributes)}${close ? `>${code}</${name}>` : "/>"}`;
const nctag = (name, properties) => tag(name, { ...properties, close: false });
const tags = {
  // inline: <script type integrity>...</script>
  // outline: <script type integrity src></script>
  script({ inline, code, type, integrity, src }) {
    return inline
      ? tag("script", { attributes: { type, integrity }, code })
      : tag("script", { attributes: { type, integrity, src } });
  },
  // inline: <style>...</style>
  // outline: <link rel="stylesheet" href />
  style({ inline, code, href, rel = "stylesheet" }) {
    return inline
      ? tag("style", { code })
      : nctag("link", { attributes: { rel, href } });
  },
  font({ href, rel = "preload", as = "font", type, crossorigin = true }) {
    return nctag("link", { attributes: { rel, href, as, type, crossorigin } });
  },
};

const render_head = (assets, fonts, head) =>
  to_sorted(assets, ({ type }) => -1 * (type === "importmap"))
    .map(({ src, code, type, inline, integrity }) =>
      type === "style"
        ? tags.style({ inline, code, href: src })
        : tags.script({ inline, code, type, integrity, src }),
    ).join("\n").concat("\n", head ?? "").concat("\n", fonts.map(href =>
      tags.font({ href, type: "font/woff2" }),
    ).join("\n"));

export default async (log, root, config) => {
  const { http } = config;
  const secure = http?.ssl !== undefined;
  const path = O.valmap(config.location, value => root.join(value));

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
    get: (config_key, fallback) => O.get(config, config_key) ?? fallback,
    set: (key, value) => {
      config[key] = value;
    },
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
    fonts: [],
    // copy files to build folder, potentially transforming them
    async stage(source, directory, filter) {
      const { paths = [], mapper = identity } = this.get("build.transform", {});
      is(paths).array();
      is(mapper).function();

      const regexs = paths.map(file => globify(file));
      const target_base = this.runpath(directory);

      // first, copy everything
      await source.copy(target_base);

      const location = this.get("location");
      const client_location = File.join(location.client, location.static).path;

      // then, copy and transform whitelisted paths using mapper
      await Promise.all((await source.collect(filter)).map(async abs_path => {
        const debased = abs_path.debase(this.root).path.slice(1);
        const rel_path = File.join(directory, abs_path.debase(source));
        if (directory.path === client_location && rel_path.path.endsWith(".css")) {
          const contents = await abs_path.text();
          const font_regex = /@font-face\s*\{.+?url\("(.+?\.woff2)"\).+?\}/gus;
          this.fonts.push(...[...contents.matchAll(font_regex)].map(match => match[1]));
        }
        const target = await target_base.join(rel_path.debase(directory));
        await target.directory.create();

        regexs.some(regex => regex.test(debased)) &&
          await target.write(mapper(await abs_path.text()));
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
        await compile.server(component, this);

        // compile client components
        await compile.client(component, this);
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
        .replace("%head%", render_head(this.assets, this.fonts, head));
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
          src: File.join(http.static.root, src ?? "").path,
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
