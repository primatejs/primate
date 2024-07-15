import register from "@primate/frontend/common/register";
import default_render from "@primate/frontend/common/render";

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
