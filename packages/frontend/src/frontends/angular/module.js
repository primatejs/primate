import { filter } from "rcompat/object";
import { register, peers } from "../common/exports.js";
import depend from "../depend.js";

const handler = ({ make, render }) => (name, props = {}, options = {}) =>
  async app => {
    const { component } = await make(name, props);
    return app.respond({ body: await render(component, props), ...options });
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
    "esbuild",
  ];
  const on = filter(peers, ([key]) => dependencies.includes(key));
  const rootname = name;
  let imports = {};

  return {
    name: `primate:${name}`,
    async init(app, next) {
      await depend(on, `frontend:${name}`);

      imports = await import("./imports.js");
      imports.set_mode(mode);

      return next(app);
    },
    async register(app, next) {
      const extensions = {
        from: extension,
        to: ".js",
      };

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
