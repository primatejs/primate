import depend from "../depend.js";
import * as O from "rcompat/object";
import { compile, peers } from "../common/exports.js";
import rootname from "./rootname.js";
import compile$ from "./compile.js";
import name from "./name.js";

const dependencies = ["eta"];

export default extension => async (app, next) => {
  const on = O.filter(await peers(), ([key]) => dependencies.includes(key));
  await depend(on, `frontend:${name}`);

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
