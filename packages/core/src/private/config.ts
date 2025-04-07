import type { LogLevel } from "#loglevel";
import type { Module } from "#module-loader";
import type { Path } from "@rcompat/fs/FileRef";
import type Dictionary from "@rcompat/record/Dictionary";
import type { BuildOptions } from "esbuild";
import type SessionManager from "#session/Manager";
import InMemorySessionManager from "#session/InMemoryManager";

type CSPProperties = "script-src" | "style-src";

export type CSP = {
  [K in CSPProperties]?: string[];
}
/*
import object from "pema/object";
import string from "pema/string";
import boolean from "pema/boolean";
import number from "pema/number";
import array from "pema/array";
import int from "pema/int";
import union from "pema/union";
import instance from "pema/instance";
import infer from "pema/infer";
import default from "pema/default";
import record from "pema/record";

const pema_config = object({
  base: default("/"),
  modules: [Module]
  pages: {
    app: default("app.html")
    error: default("error.html"),
  },
  log: {
    //level: LogLevel,
    trace: default(true)
  },
  http: {
    host: default("localhost"),
    port: int.range(80, 1000).default(6161),
    csp: {},
    static: {
      root: default("/"),
    },
    ssl: {
      key: union(FileRef, string).optional()
      cert: union(FileRef, string).optional()
    }
  },
  session: {
    manager: instance(SessionManager).default(InMemorySessionManager)
    implicit: default(false)
    cookie: {
      name: default("session_id")
      same_site: union("Strict", "Lax", "None")
      http_only: default(true)
      path: infer`/${string}`.default("/")
    },
  },
  request: {
    body: {
      parse: default(true),
    },
  },
  build: {
    name: default("app"),
    includes: [string],
    excludes: [string],
    define: record(string, string)
  },
});
*/

export type Config = {
  base: string,
  modules?: Module[],
  pages: {
    app: string,
    error: string,
  },
  log: {
    level: LogLevel,
    trace: boolean,
  },
  http: {
    host: string,
    port: number,
    csp?: CSP,
    headers?: Dictionary,
    static: {
      root: string,
    },
    ssl?: {
      key: Path,
      cert: Path,
    }
  },
  session: {
    manager: SessionManager,
    implicit: boolean,
    cookie: {
      name: string,
      same_site: "Strict" | "Lax" | "None",
      http_only: boolean,
      path: `/${string}`,
    },
  },
  request: {
    body: {
      parse: boolean,
    },
  },
  location: {
    // renderable components
    components: string,
    // HTML pages
    pages: string,
    // hierarchical routes
    routes: string,
    // static assets
    static: string,
    // build environment
    build: string,
    // client build
    client: string,
    // server build
    server: string,
  },
  build: BuildOptions & {
    name: string,
    includes: string[],
    excludes: string[],
  },
}

export default {
  base: "/",
  modules: [],
  pages: {
    app: "app.html",
    error: "error.html",
  },
  log: {
    level: "warn",
    trace: false,
  },
  http: {
    host: "localhost",
    port: 6161,
    csp: {},
    static: {
      root: "/",
    },
  },
  session: {
    manager: new InMemorySessionManager(),
    implicit: false,
    cookie: {
      name: "session_id",
      same_site: "Strict",
      http_only: true,
      path: "/",
    },
  },
  request: {
    body: {
      parse: true,
    },
  },
  location: {
    // renderable components
    components: "components",
    // HTML pages
    pages: "pages",
    // hierarchical routes
    routes: "routes",
    // static assets
    static: "static",
    // build environment
    build: "build",
    // client build
    client: "client",
    // server build
    server: "server",
  },
  build: {
    name: "app",
    includes: [],
    excludes: [],
    define: {},
  },
} as const satisfies Config;
