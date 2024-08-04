import name from "#name";
import compile from "@primate/frontend/core/compile";
import server from "./server.js";

export default (extension, options) => async (app, next) => {
  app.register(extension, {
    ...await compile({
      app,
      extension,
      name,
      compile: { server: server(options) },
    }),
    // no support for hydration
    client: _ => _,
  });

  return next(app);
};
