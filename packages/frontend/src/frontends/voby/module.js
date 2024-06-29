import "linkedom-global";
import * as O from "rcompat/object";
import { compile, load, peers } from "../common/exports.js";
import depend from "../depend.js";

const handler = ({ directory, render }) => (name, props = {}, options = {}) =>
  async app => {
    const components = app.runpath(app.get("location.server"), directory);
    const { default : component } = await load(components.join(name));

    return app.view({ body: await render(component, props), ...options });
  };

const name = "voby";
const dependencies = ["voby", "linkedom-global"];
const default_extension = ".voby";
const on = O.filter(peers, ([key]) => dependencies.includes(key));

export default ({ extension = default_extension } = {}) => {
  const rootname = name;

  return {
    name: `primate:${name}`,
    async init(app, next) {
      await depend(on, `frontend:${name}`);

      const imports = await import("./imports.js");

      app.register(extension, {
        handle: handler({
          directory: app.get("location.components"),
          render: imports.render,
        }),
        compile: {
          ...await compile({
            app,
            extension,
            rootname,
            compile: imports.compile,
          }),
          // no support for hydration
          client: _ => _,
        },
      });

      return next(app);
    },
  };
};

