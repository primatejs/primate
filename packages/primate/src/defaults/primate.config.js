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
      pure: false,
    },
  },
  layout: "index.html",
  paths: {
    build: "build",
    layouts: "layouts",
    components: "components",
    static: "static",
    routes: "routes",
    types: "types",
    guards: "guards",
  },
  modules: [],
  dist: "app",
  types: {
    explicit: false,
  },
};
