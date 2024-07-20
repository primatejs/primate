import register from "@primate/frontend/common/register";
import render from "./render.js";
import rootname from "./rootname.js";
import set_mode from "./set-mode.js";

const handler = ({ load }) => (name, props = {}, options = {}) => async app => {
  const { component } = await load(name, props);

  return app.view({ body: await render(component, props), ...options });
};

export default extension => (app, next) => {
  // todo: base on app mode
  set_mode("production");

  app.register(extension, handler(register({ app, rootname })));

  return next(app);
};
