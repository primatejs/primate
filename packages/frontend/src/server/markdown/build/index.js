import compile from "#compile";
import name from "#markdown/name";
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
