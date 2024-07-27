import compile from "@primate/frontend/base/compile";
import { name } from "@primate/frontend/markdown/common";
import { server } from "./compile.js";

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
