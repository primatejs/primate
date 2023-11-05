import { Response, Status, MediaType } from "rcompat/http";
import { filter } from "rcompat/object";
import { register, compile, peers } from "../common/exports.js";
import depend from "../depend.js";

const name = "vue";
const dependencies = ["vue"];
const default_extension = "vue";

const handler = ({ make, createSSRApp, render }) =>
  (name, props = {}, { status = Status.OK, page } = {}) =>
    async app => {
      const imported = await make(name, props);
      const component = createSSRApp({
      render: imported.component.render,
      data: () => props,
    });
      const body = await render(component);

      return new Response(await app.render({ body, page }), {
      status,
      headers: { ...app.headers(), "Content-Type": MediaType.TEXT_HTML },
    });
    };

export default ({ extension = default_extension } = {}) => {
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
