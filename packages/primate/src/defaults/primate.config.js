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
  paths: {
    build: "build",
    components: "components",
    pages: "pages",
    routes: "routes",
    static: "static",
    types: "types",
  },
  build: {
    includes: [],
    static: "static",
    app: "app",
    modules: "modules",
    index: "index.js",
  },
  types: {
    explicit: false,
  },
};
