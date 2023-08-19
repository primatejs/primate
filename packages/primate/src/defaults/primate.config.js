import {identity} from "runtime-compat/function";
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
    csp: {
      "default-src": "'self'",
      "style-src": "'self'",
      "script-src": "'self'",
      "object-src": "'none'",
      "frame-ancestors": "'none'",
      "form-action": "'self'",
      "base-uri": "'self'",
    },
    static: {
      root: "/",
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
    includes: ["test"],
    index: "index.js",
    transform: {
      files: [],
      mapper: identity,
    },
  },
  types: {
    explicit: false,
  },
};
