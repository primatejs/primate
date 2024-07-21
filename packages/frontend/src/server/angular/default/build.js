import { dependencies, name } from "@primate/frontend/angular/common";
import depend from "@primate/frontend/base/depend";
import { server } from "./compile.js";

export default extension => async (app, next) => {
  await depend(dependencies, name);

  const extensions = {
    from: extension,
    to: ".js",
  };

  app.register(extension, {
    server: component => server(app, component, extensions),
    client: _ => _,
  });

  return next(app);
};
