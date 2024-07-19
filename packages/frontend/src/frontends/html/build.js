import { compile } from "../common/exports.js";
import compile$ from "./compile.js";
import rootname from "./rootname.js";

export default extension => async (app, next) => {
  app.register(extension, {
    ...await compile({
      app,
      extension,
      rootname,
      compile: compile$,
    }),
    // no support for hydration
    client: _ => _,
  });

  return next(app);
};
