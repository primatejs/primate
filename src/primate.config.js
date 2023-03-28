export default {
  base: "/",
  debug: false,
  http: {
    host: "localhost",
    port: 6161,
    csp: {
      "default-src": "'self'",
      "object-src": "'none'",
      "frame-ancestors": "'none'",
      "form-action": "'self'",
      "base-uri": "'self'",
    },
  },
  paths: {
    public: "public",
    static: "static",
    routes: "routes",
    components: "components",
  },
  modules: [],
};