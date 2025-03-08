import default_render from "#render";

const serve = render => (name, props = {}, options = {}) => async app => {
  const component = await app.component(name);

  return app.view({ body: await render(component, props), ...options });
};

export default ({ render = default_render } = {}) => extension => (app, next) => {
  app.register(extension, serve(render));

  return next(app);
};
