import { LogLevel } from "#loglevel";
import type { Module } from "#module-loader";
import type { Path } from "@rcompat/fs/FileRef";
import type { BuildOptions } from "esbuild";

type CSPProperties = "script-src" | "style-src";

export type CSP = {
  [K in CSPProperties]?: string[];
}

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
    headers?: Record<string, unknown>
    static: {
      root: string,
    },
    ssl?: {
      key: Path,
      cert: Path,
    }
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
