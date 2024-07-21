import compile from "@primate/frontend/base/compile";
import { name } from "@primate/frontend/html/common";
import { server } from "./compile.js";

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