import name from "#name";
import compile from "@primate/frontend/core/compile";
import server from "./server.js";

export default extension => async (app, next) => {
  app.register(extension, {
    ...await compile({
      app,
      extension,
      name,
      compile: { server },
    }),
    // no support for hydration
    client: _ => _,
  });

  return next(app);
};
