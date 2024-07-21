import compile from "@primate/frontend/base/compile";
import depend from "@primate/frontend/base/depend";
import peerdeps from "@primate/frontend/base/peerdeps";
import { name, rootname } from "@primate/frontend/voby/common";
import * as O from "rcompat/object";
import { server } from "./compile.js";

const dependencies = ["voby", "linkedom-global"];

export default extension => async (app, next) => {
  const on = O.filter(await peerdeps(), ([key]) => dependencies.includes(key));
  await depend(on, `frontend:${name}`);

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
