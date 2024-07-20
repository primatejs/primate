import register from "@primate/frontend/common/register";
import rootname from "./rootname.js";
import handler from "./handler.js";

export default extension => (app, next) => {
  app.register(extension, handler(register({ app, rootname })));

  return next(app);
};
