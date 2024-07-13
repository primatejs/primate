import * as O from "rcompat/object";
import { register, peers } from "../common/exports.js";
import depend from "../depend.js";
import * as imports from "./imports.js";

const handler = ({ make, render }) => (name, props = {}, options = {}) =>
  async app => {
    const { component } = await make(name, props);
    return app.view({ body: await render(component, props), ...options });
  };

export default ({
  extension = ".component.ts",
  mode = "production",
} = {}) => {
  const name = "angular";
  const dependencies = [
    "@angular/compiler",
    "@angular/core",
    "@angular/platform-browser",
    "@angular/platform-server",
    "@angular/ssr",
  ];
  const rootname = name;

  const extensions = {
    from: extension,
    to: ".js",
  };

  return {
    name: `primate:${name}`,
    async build(app, next) {
      const on = O.filter(await peers(), ([key]) => dependencies.includes(key));
      await depend(on, `frontend:${name}`);

      imports.set_mode(mode);

      app.register(extension, {
        server: component => imports.compile.server(app, component,
          extensions),
        client: _ => _,
      });

      return next(app);
    },
    serve(app, next) {
      app.register(extension, handler(register({
        app,
        rootname,
        render: imports.render,
      })));

      return next(app);
    },
  };
};
