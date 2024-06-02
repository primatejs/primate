import o from "rcompat/object";
import { register, peers } from "../common/exports.js";
import depend from "../depend.js";

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
  const on = o.filter(peers, ([key]) => dependencies.includes(key));
  const rootname = name;
  let imports = {};

  const extensions = {
    from: extension,
    to: ".js",
  };

  return {
    name: `primate:${name}`,
    async init(app, next) {
      await depend(on, `frontend:${name}`);

      imports = await import("./imports.js");
      imports.set_mode(mode);

      app.register(extension, {
        handle: handler(register({
          app,
          rootname,
          render: imports.render,
        })),
        compile: {
          server: component => imports.compile.server(app, component,
            extensions),
          client: _ => _,
        },
      });

      return next(app);
    },
  };
};
