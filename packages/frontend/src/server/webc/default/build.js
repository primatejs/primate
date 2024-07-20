import compile from "@primate/frontend/common/compile";
import normalize from "@primate/frontend/common/normalize";
import name from "@primate/frontend/webc/common/name";
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
