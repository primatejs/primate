import * as compiler from "@marko/compiler";
import compile from "@primate/frontend/common/compile";
import depend from "@primate/frontend/common/depend";
import peerdeps from "@primate/frontend/common/peerdeps";
import * as O from "rcompat/object";
import name from "./name.js";
import rootname from "./rootname.js";

const dependencies = ["@marko/compiler", "@marko/translator-default"];

const server = async text => (await compiler.compile(text, "")).code;

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
