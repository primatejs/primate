import type Frontend from "#Frontend";
import default_render from "#frontend/render";
import type { ServeAppHook } from "#module-loader";

const serve = (render: typeof default_render): Frontend =>
  (name, props = {}, options = {}) => async app => {
    const component = app.get_component(name);

    return app.view({ body: await render(component, props), ...options });
};

export default ({ render = default_render } = {}) =>
  (extension: string): ServeAppHook => (app, next) => {
    app.register(extension, serve(render));

    return next(app);
};
