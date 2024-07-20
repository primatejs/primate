import compile from "@primate/frontend/common/compile";
import depend from "@primate/frontend/common/depend";
import peerdeps from "@primate/frontend/common/peerdeps";
import name from "@primate/frontend/handlebars/common/name";
import rootname from "@primate/frontend/handlebars/common/rootname";
import handlebars from "handlebars";
import * as O from "rcompat/object";

const dependencies = ["handlebars"];

const server = text => `export default ${handlebars.precompile(text)};`;

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
