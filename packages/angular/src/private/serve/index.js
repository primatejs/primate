import render from "./render.js";
import set_mode from "./set-mode.js";
import client from "#client";
import normalize from "#normalize";

const serve = (name, props = {}, options = {}) => async app => {
  const component = await app.get_component(name);

  const normalized = await normalize(name);
  const code = client({ component: normalized, props });
  const inlined = await app.inline(code, "module");
  const script_src = [inlined.integrity];

  return app.view({
    body: await render(component, props),
    head: inlined.head,
    headers: app.headers({ "script-src": script_src }),
    ...options,
  });
};

export default extension => (app, next) => {
  // todo: base on app mode
  set_mode("production");

  app.register(extension, serve);

  return next(app);
};
