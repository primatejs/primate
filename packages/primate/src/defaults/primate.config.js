import Logger from "../Logger.js";

export default {
  base: "/",
  logger: {
    level: Logger.Warn,
  },
  http: {
    host: "localhost",
    port: 6161,
    csp: {
      "default-src": "'self'",
      "style-src": "'self'",
      "object-src": "'none'",
      "frame-ancestors": "'none'",
      "form-action": "'self'",
      "base-uri": "'self'",
    },
    static: {
      root: "/",
    },
  },
  pages: {
    app: "app.html",
    error: "error.html",
  },
  paths: {
    build: "build",
    static: "static",
    components: "components",
    pages: "pages",
    routes: "routes",
    types: "types",
  },
  build: {
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
