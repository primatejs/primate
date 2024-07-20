import depend from "@primate/frontend/common/depend";
import compile from "@primate/frontend/common/compile";
import peerdeps from "@primate/frontend/common/peerdeps";
import * as O from "rcompat/object";
import compile$ from "./compile.js";
import name from "./name.js";

const dependencies = ["marked"];

const rootname = "markdown";

export default (extension, options) => async (app, next) => {
  const on = O.filter(peerdeps(), ([key]) => dependencies.includes(key));
  await depend(on, `frontend:${name}`);

  const { server } = compile$(options);
  app.register(extension, {
    ...await compile({
      app,
      extension,
      rootname,
      compile: { server },
    }),
    // no support for hydration
    client: _ => _,
  });

  return next(app);
};
