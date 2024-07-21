import compile from "@primate/frontend/base/compile";
import depend from "@primate/frontend/base/depend";
import { dependencies, name } from "@primate/frontend/voby/common";
import { server } from "./compile.js";

export default extension => async (app, next) => {
  await depend(dependencies, name);

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
