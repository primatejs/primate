import register from "@primate/frontend/common/register";
import rootname from "@primate/frontend/html/common/rootname";
import handler from "./handler.js";

export default extension => (app, next) => {
  app.register(extension, handler(register({ app, rootname })));

  return next(app);
};
