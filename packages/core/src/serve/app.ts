import type * as Asset from "#asset";
import type App from "#App";
import type { CSP } from "#config";
import double_extension from "#error/double-extension";
import type Frontend from "#Frontend";
import log from "#log";
import type Mode from "#Mode";
import module_loader from "#module-loader";
import type { Route, RouteSpecial } from "#serve";
import dim from "@rcompat/cli/color/dim";
import crypto from "@rcompat/crypto";
import FileRef from "@rcompat/fs/FileRef";
import join from "@rcompat/fs/join";
import Router from "@rcompat/fs/router";
import type Conf from "@rcompat/http/Conf";
import { html } from "@rcompat/http/mime";
import serve from "@rcompat/http/serve";
import type Server from "@rcompat/http/Server";
import Status from "@rcompat/http/Status";
import is from "@rcompat/invariant/is";
import type Dictionary from "@rcompat/record/Dictionary";
import empty from "@rcompat/record/empty";
import entries from "@rcompat/record/entries";
import get from "@rcompat/record/get";
import stringify from "@rcompat/record/stringify";
import handle from "./hook/handle.js";
import type { BuildFiles, Options } from "./index.js";
import loader from "./loader.js";
import parse from "./parse.js";

type RSS = Record<string, string>;

type Entry<T> = [keyof T, Required<T>[keyof T]]

const to_csp = (config_csp: Entry<CSP>[], assets: CSP, override: CSP) => config_csp
  // only csp entries in the config will be enriched
  .map<Entry<CSP>>(([key, directives]) =>
    // enrich with application assets
    [key, assets[key] ? directives.concat(...assets[key]) : directives]
  )
  .map<Entry<CSP>>(([key, directives]) =>
    // enrich with explicit csp
    [key, override[key] ? directives.concat(...override[key]) : directives]
  )
  .map(([key, directives]) => `${key} ${directives.join(" ")}`)
  .join(";");

const attribute = (attributes: RSS) => empty(attributes)
  ? ""
  : " ".concat(Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`).join(" "))
  ;
const tag = (name: string, { attributes = {}, code = "", close = true }) =>
  `<${name}${attribute(attributes)}${close ? `>${code}</${name}>` : "/>"}`;
const nctag = (name: string, properties: Dictionary) =>
  tag(name, { ...properties, close: false });
const tags = {
  // inline: <script type integrity>...</script>
  // outline: <script type integrity src></script>
  script({ inline, code, type, integrity, src }: Asset.Script) {
    return inline
      ? tag("script", { attributes: { type, integrity }, code })
      : tag("script", { attributes: { type, integrity, src } });
  },
  // inline: <style>...</style>
  // outline: <link rel="stylesheet" href />
  style({ inline, code, href }: Asset.Style) {
    return inline
      ? tag("style", { code })
      : nctag("link", { attributes: { rel: "stylesheet", href } });
  },
  font({ href, rel = "preload", as = "font", type, crossorigin = "true" }: Asset.Font) {
    return nctag("link", { attributes: { rel, href, as, type, crossorigin } });
  },
};

const render_head = (assets: Options["assets"], fonts: unknown[], head?: string) =>
  assets.toSorted(({ type }) => -1 * Number(type === "importmap"))
    .map(({ src, code, type, inline, integrity }) =>
      type === "style"
        ? tags.style({ inline, code, href: src } as Asset.Style)
        : tags.script({ inline, code, type, integrity, src } as Asset.Script),
    ).join("\n").concat("\n", head ?? "").concat("\n", fonts.map(href =>
      tags.font({ href, type: "font/woff2" } as Asset.Font),
    ).join("\n"));

const encoder = new TextEncoder();
const hash = async (data: string, algorithm = "sha-384") => {
  const bytes = await crypto.subtle.digest(algorithm, encoder.encode(data));
  const prefix = algorithm.replace("-", _ => "");
  return`${prefix}-${btoa(String.fromCharCode(...new Uint8Array(bytes)))}`;
};

interface RenderOptions {
  body: string,
  head?: string,
  partial?: boolean,
  placeholders?: Omit<Dictionary, "body" | "head">,
  page?: string,
};

interface PublishOptions {
  src?: string,
  code: string,
  type: string,
  inline: boolean
};

type RecordMaybe<T> = Record<string, T | undefined>;

export interface ServeApp extends App {
  hash: typeof hash,
  secure: boolean,
  assets: Options["assets"],
  files: BuildFiles,
  get_component(name: string): unknown,
  frontends: RecordMaybe<Frontend>,
  headers(csp?: Dictionary): Dictionary<string>,
  asset_csp: CSP,
  render(content: RenderOptions): string,
  loader: ReturnType<typeof loader>,
  respond(...args: ConstructorParameters<typeof Response>): Response,
  view(options: ResponseInit & RenderOptions): Response,
  media(type: string, options?: ResponseInit): ResponseInit,
  inline(code: string, type: "style" | "script" | "module"): Promise<{
    head: string,
    integrity: string,
  }>,
  publish(options: PublishOptions): Promise<undefined>,
  create_csp(): undefined,
  register(extension: string, frontend: Frontend): undefined;
  build_target: string,
  start(): Promise<undefined>,
  stop(): undefined,
  server(): Server,
  mode: Mode,
  router: ReturnType<typeof Router.init<Route, RouteSpecial>>;
}

export default async (rootfile: string, build: Options): Promise<ServeApp> => {
  const root = new FileRef(rootfile).directory;
  const { config, files, components, loader, target, mode } = build;
  const assets = await Promise.all(build.assets.map(async asset => {
    const code = asset.type === "importmap" 
      ? stringify(asset.code as Record<string, unknown>)
      : asset.code as string;
    return {
      ...asset,
      code,
      integrity: await hash(code),
    };
  }));

  const { http } = build.config;
  const path = entries(config.location).valmap(([, value]) =>
    root.join(value)).get();

  const secure = http.ssl !== undefined;

  const $components = Object.fromEntries(components ?? []);
  const error = path.routes.join("+error.js");
  const kv_storage = new Map<symbol, unknown>();
  const s_http = Symbol("s_http");

  kv_storage.set(s_http, {
    host: http.host,
    port: http.port,
    ssl: http.ssl?.key && http.ssl.key ? {
      key: root.join(http.ssl.key),
      cert: root.join(http.ssl.cert),
    } : {},
  })

  let server: Server;

  const app = {
    // empty
    asset_csp: {},
    importmaps: {},
    frontends: {},
    fonts: [],

    mode,
    secure,
    assets,
    files,
    hash,
    build_target: target,
    loader: loader,
    path,
    root,
    error: {
      default: await error.exists() ? await error.import("default") : undefined,
    },
    modules: await module_loader(root, config.modules ?? []),

    // functions
    get_component(name: string) {
      const component = $components[name];
      return component.default ?? component;
    },
    config: <P extends string>(path: P) => get(config, path),
    get<T>(key: symbol) {
      return kv_storage.get(key) as T;
    },
    set: (key, value) => {
      if (kv_storage.has(key)) {
        // throw erro
      }
      kv_storage.set(key, value);
    },
    headers(csp = {}) {
      const http_csp = Object.entries(this.config("http.csp") ?? {}) as Entry<CSP>[];

      return {
        ...this.config("http.headers") ?? {},
        ...http_csp.length === 0 ? {} : {
          "Content-Security-Policy": to_csp(
            http_csp,
            this.asset_csp,
            csp),
        },
      };
    },
    runpath(...directories) {
      return this.root.join(...directories);
    },
    render(content) {
      const { body, head, partial, placeholders = {}, page } = content;
      ["body", "head"].forEach(key => is(placeholders[key]).undefined());

      return partial ? body : Object.entries(placeholders)
        // replace given placeholders, defaulting to ""
        .reduce((html, [key, value]) => html.replace(`%${key}%`, value?.toString() ?? ""),
          this.loader.page(page))
        // replace non-given placeholders, aside from %body% / %head%
        .replaceAll(/(?<keep>%(?:head|body)%)|%.*?%/gus, "$1")
        // replace body and head
        .replace("%body%", body)
        .replace("%head%", render_head(this.assets, this.fonts, head));
    },
    respond(body, { status = Status.OK, headers = {} } = {}) {
      return new Response(body, { status, headers: {
        "Content-Type": html, ...this.headers(), ...headers },
      });
    },
    view(options) {
      // split render and respond options
      const { status = Status.OK, headers = {}, statusText, ...rest } = options;
      return this.respond(this.render(rest), { status, headers });
    },
    media(type, { status = Status.OK, headers } = {}): ResponseInit {
      return { status, headers: { ...headers, "Content-Type": type } };
    },
    async inline(code, type) {
      const integrity = await this.hash(code);
      return { head: type === "style"
        ? tags.style({ code, inline: true })
        : tags.script({ code, type, inline: true, integrity})
        , integrity: `'${integrity}'` };
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
      this.create_csp();
    },
    create_csp() {
      this.asset_csp = this.assets.map(({ type: directive, integrity }) =>
        [`${directive === "style" ? "style" : "script"}-src`, integrity])
        .reduce((csp: CSP, [directive, hash]) =>
          ({ ...csp, [directive]: csp[directive as keyof CSP]!.concat(`'${hash}'`) }),
          { "style-src": [], "script-src": [] },
        );
    },
    register(extension, frontend) {
      if (this.frontends[extension] !== undefined) {
        double_extension(extension);
      }
      this.frontends[extension] = frontend;
    },
    async start() {
      const _handle = handle(this);
      server = await serve(async request => {
        try {
          return await _handle(parse(request));
        } catch (error) {
          log.auto(error as any);
          return new Response(null, { status: Status.INTERNAL_SERVER_ERROR });
        }
      }, this.get<Conf>(s_http));
      const { host, port } = this.config("http");
      const address = `http${this.secure ? "s" : ""}://${host}:${port}`;
      log.system(`started ${dim("->")} ${dim(address)}`);
    },
    stop() {
      server.stop();
    },
    server() {
      return server;
    },
    // noops
    target(_, _1) {},
    bind(_, _1) {},
    router: Router.init<Route, RouteSpecial>({
        import: true,
        extensions: [".js"],
        specials: {
          guard: { recursive: true },
          error: { recursive: false },
          layout: { recursive: true },
        },
        predicate(route, request) {
          return (route as { default: Record<string, unknown> })
            .default[request.method.toLowerCase()] !== undefined;
        },
      }, files.routes),
  } as const satisfies ServeApp;

  return app;
};
