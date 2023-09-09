import {Response, Status} from "runtime-compat/http";
import {filter} from "runtime-compat/object";
import {compile, peers, load} from "../common/exports.js";
import depend from "../../depend.js";

const handler = ({directory, render}) =>
  (name, props = {}, {status = Status.OK, page} = {}) => async app => {
    const components = app.runpath(app.config.location.server, directory);
    const {default : component} = await load(components.join(name));

    const body = render(component, props);

    const headers = await app.headers();

    return new Response(await app.render({body, page}), {status, headers});
  };

const name = "handlebars";
const dependencies = ["handlebars"];
const default_extension = "hbs";
const on = filter(peers, ([key]) => dependencies.includes(key));

export default ({
  directory,
  extension = default_extension,
} = {}) => {
  const rootname = name;
  let imports = {};

  return {
    name: `primate:${name}`,
    async init(app, next) {
      await depend(on, `frontend:${name}`);

      imports = await import("./imports.js");

      return next(app);
    },
    register(app, next) {
      const {config} = app;

      app.register(extension, handler({
        directory: directory ?? config.location.components,
        render: imports.render,
      }));

      return next(app);
    },
    async compile(app, next) {
      await compile({
        app,
        directory: directory ?? app.config.location.components,
        extension,
        rootname,
        compile: imports.compile.server,
      });

      return next(app);
    },
  };
};

