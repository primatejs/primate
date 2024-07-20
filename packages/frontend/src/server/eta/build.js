import compile from "@primate/frontend/common/compile";
import depend from "@primate/frontend/common/depend";
import peerdeps from "@primate/frontend/common/peerdeps";
import { Eta } from "eta";
import * as O from "rcompat/object";
import name from "./name.js";
import rootname from "./rootname.js";

const eta = new Eta();
const dependencies = ["eta"];

const server = text => `
  import { Eta } from "eta";
  const eta = new Eta();

  ${eta.compile(text).toString()}

  export default (props, options) => anonymous.call(eta, props, options);
`;

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
