import { filter } from "rcompat/object";
import { register, compile, peers } from "../common/exports.js";
import depend from "../depend.js";

const handler = ({ createSSRApp, make, render }) =>
  (name, props = {}, options = {}) =>
    async app => {
      const component = createSSRApp({
        render: (await make(name, props)).component.render,
        data: () => props,
      });

      return app.respond({ body: await render(component), ...options });
    };

export default ({ extension = ".vue" } = {}) => {
  const name = "vue";
  const dependencies = ["vue"];
  const on = filter(peers, ([key]) => dependencies.includes(key));
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
      app.register(extension, {
        handle: handler(register({
          app,
          rootname,
          createSSRApp: imports.createSSRApp,
          render: imports.render,
        })),
        compile: {
          ...await compile({
            app,
            extension,
            rootname,
            compile: imports.compile,
          }),
          // no support yet for hydration
          client: _ => _,
        },
      });

      return next(app);
    },
  };
};
