import { DoubleFileExtension } from "@primate/core/errors";
import crypto from "@rcompat/crypto";
import join from "@rcompat/fs/join";
import { html } from "@rcompat/http/mime";
import { OK } from "@rcompat/http/status";
import is from "@rcompat/invariant/is";
import empty from "@rcompat/object/empty";
import get from "@rcompat/object/get";
import valmap from "@rcompat/object/valmap";
import * as loaders from "./loaders/exports.js";
import to_sorted from "./to_sorted.js";

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

const encoder = new TextEncoder();

const attribute = attributes => empty(attributes)
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

export default async (log, root, { config, assets, files, components, loader, target, mode }) => {
  const { http } = config;
  const secure = http?.ssl !== undefined;
  const path = valmap(config.location, value => root.join(value));

  // if ssl activated, resolve key and cert early
  if (secure) {
    http.ssl.key = root.join(http.ssl.key);
    http.ssl.cert = root.join(http.ssl.cert);
  }

  const $components = Object.fromEntries(components ?? []);
  const error = await path.routes.join("+error.js");

  return {
    secure,
    importmaps: {},
    assets,
    files,
    path,
    root,
    log,
    get_component(name) {
      const component = $components[name];
      return component?.default ?? component;
    },
    // pseudostatic thus arrowbound
    get: (config_key, fallback) => get(config, config_key) ?? fallback,
    set: (key, value) => {
      config[key] = value;
    },
    error: {
      default: await error.exists() ? await error.import("default") : undefined,
    },
    handlers: {},
    modules: await loaders.modules(log, root, config.modules ?? []),
    fonts: [],
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
      return this.root.join(...directories);
    },
    async render(content) {
      const { body, head, partial, placeholders = {}, page } = content;
      ["body", "head"].every(used => is(placeholders[used]).undefined());

      return partial ? body : Object.entries(placeholders)
        // replace given placeholders, defaulting to ""
        .reduce((html, [key, value]) => html.replace(`%${key}%`, value ?? ""),
          this.loader.page(page))
        // replace non-given placeholders, aside from %body% / %head%
        .replaceAll(/(?<keep>%(?:head|body)%)|%.*?%/gus, "$1")
        // replace body and head
        .replace("%body%", body)
        .replace("%head%", render_head(this.assets, this.fonts, head));
    },
    respond(body, { status = OK, headers = {} } = {}) {
      return new Response(body, { status, headers: {
        "Content-Type": html, ...this.headers(), ...headers },
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
          src: join(http.static.root, src ?? "").path,
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
    create_csp() {
      this.asset_csp = this.assets.map(({ type: directive, integrity }) => [
        `${directive === "style" ? "style" : "script"}-src`, integrity])
        .reduce((csp, [directive, hash]) =>
          ({ ...csp, [directive]: csp[directive].concat(`'${hash}'`) } ),
          { "style-src": [], "script-src": [] },
        );
    },
    register(extension, handle) {
      is(this.handlers[extension]).undefined(DoubleFileExtension.new(extension));
      this.handlers[extension] = handle;
    },
    async hash(data, algorithm = "sha-384") {
      const bytes = await crypto.subtle.digest(algorithm, encoder.encode(data));
      const prefix = algorithm.replace("-", _ => "");
      return `${prefix}-${btoa(String.fromCharCode(...new Uint8Array(bytes)))}`;
    },
    // noop
    target(name, handler) {},
    build_target: target,
    loader,
    stop() {
      this.get("server").stop();
    },
    mode,
  };
};
