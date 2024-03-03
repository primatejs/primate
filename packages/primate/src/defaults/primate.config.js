import { identity } from "rcompat/function";
import Logger from "../Logger.js";

export default {
  base: "/",
  modules: [],
  pages: {
    index: "app.html",
    error: "error.html",
  },
  logger: {
    level: Logger.Warn,
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
    // runtime types
    types: "types",
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
    transform: {
      paths: [],
      mapper: identity,
    },
  },
};
