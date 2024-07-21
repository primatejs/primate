import register from "@primate/frontend/base/register";
import { rootname } from "@primate/frontend/vue/common";
import handler from "./handler.js";

export default extension => (app, next) => {
  app.register(extension, handler(register({ app, rootname })));

  return next(app);
};
