import Logger from "../Logger.js";

export default {
  base: "/",
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
  index: "app.html",
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
  modules: [],
  types: {
    explicit: false,
  },
};
