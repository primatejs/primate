import default_render, { type Render } from "#frontend/render";
import type { ServeAppHook } from "#module-loader";

export default (render?: Render) =>
  (extension: string): ServeAppHook => (app, next) => {
    app.register(extension, (name, props = {}, options = {}) => async _app => {
      const component = _app.component(name);

      return app.view({ body: await (render ?? default_render)(component, props), ...options });
    });

    return next(app);
};
