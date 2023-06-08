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
  layout: "index.html",
  paths: {
    build: "build",
    static: "static",
    components: "components",
    layouts: "layouts",
    routes: "routes",
    types: "types",
    guards: "guards",
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
