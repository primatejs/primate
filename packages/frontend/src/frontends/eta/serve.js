import { register } from "../common/exports.js";
import render from "./render.js";
import rootname from "./rootname.js";

const handler = ({ load }) => (name, props = {}, options = {}) => async app => {
  const { component } = await load(name, props);

  return app.view({ body: render(component, props), ...options });
};

export default extension => (app, next) => {
  app.register(extension, handler(register({ app, rootname })));

  return next(app);
};
