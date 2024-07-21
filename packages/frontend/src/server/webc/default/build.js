import compile from "@primate/frontend/base/compile";
import { name } from "@primate/frontend/webc/common";
import { client } from "./compile.js";
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
