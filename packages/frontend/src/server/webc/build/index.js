import compile from "#compile";
import name from "#webc/name";
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
