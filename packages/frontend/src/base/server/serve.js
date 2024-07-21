import register from "./register.js";
import default_render from "./render.js";

const serve = render =>
  ({ load }) =>
    (name, props = {}, options = {}) =>
      async app => {
        const { component } = await load(name, props);

        return app.view({ body: await render(component, props), ...options });
      };

export default ({ rootname, render = default_render }) =>
  extension =>
    (app, next) => {
      app.register(extension, serve(render)(register({ app, rootname })));

      return next(app);
    };
