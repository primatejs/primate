import compile from "@primate/frontend/base/compile";
import depend from "@primate/frontend/base/depend";
import peerdeps from "@primate/frontend/base/peerdeps";
import { name } from "@primate/frontend/markdown/common";
import * as O from "rcompat/object";
import { server } from "./compile.js";

const dependencies = ["marked"];

const rootname = "markdown";

export default (extension, options) => async (app, next) => {
  const on = O.filter(peerdeps(), ([key]) => dependencies.includes(key));
  await depend(on, `frontend:${name}`);

  app.register(extension, {
    ...await compile({
      app,
      extension,
      rootname,
      compile: { server: server(options) },
    }),
    // no support for hydration
    client: _ => _,
  });

  return next(app);
};
