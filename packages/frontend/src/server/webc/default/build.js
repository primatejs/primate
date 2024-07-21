import compile from "@primate/frontend/base/compile";
import normalize from "@primate/frontend/base/normalize";
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
      normalize: normalize(name),
    }),
    // noop
    server: _ => _,
  });

  app.build.plugin(publish(app, extension));

  return next(app);
};
