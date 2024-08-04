import name from "#name";
import compile from "@primate/frontend/core/compile";
import client from "./client.js";
import publish from "./publish.js";

export default extension => async (app, next) => {
  app.register(extension, {
    ...await compile({
      app,
      extension,
      name,
      compile: { client: client(app, extension) },
    }),
    // noop
    server: _ => _,
  });

  app.build.plugin(publish(app, extension));

  return next(app);
};
