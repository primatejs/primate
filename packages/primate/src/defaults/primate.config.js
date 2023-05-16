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
  paths: {
    layouts: "layouts",
    static: "static",
    public: "public",
    routes: "routes",
    components: "components",
    types: "types",
  },
  modules: [],
  dist: "app",
};
