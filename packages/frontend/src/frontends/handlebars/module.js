import { Response, Status } from "rcompat/http";
import { filter } from "rcompat/object";
import { compile, peers, load, render as $render } from "../common/exports.js";
import depend from "../depend.js";

const handler = ({ directory, render }) => (name, props = {}, options = {}) =>
  async app => {
    const components = app.runpath(app.config.location.server, directory);
    const { default : component } = await load(components.join(name));
    const body = render(component, props);
    const headers = await app.headers();

    return new Response(await $render(body, null, { app, ...options }), {
      status: options.status ?? Status.OK,
      headers,
    });
  };

const name = "handlebars";
const dependencies = ["handlebars"];
const default_extension = ".hbs";
const on = filter(peers, ([key]) => dependencies.includes(key));

export default ({ extension = default_extension } = {}) => {
  const rootname = name;
  let imports = {};

  return {
    name: `primate:${name}`,
    async init(app, next) {
      await depend(on, `frontend:${name}`);

      imports = await import("./imports.js");

      return next(app);
    },
    async register(app, next) {
      const { config } = app;

      app.register(extension, {
        handle: handler({
          directory: config.location.components,
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

