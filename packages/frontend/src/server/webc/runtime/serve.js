import register from "@primate/frontend/base/register";
import { name } from "@primate/frontend/webc/common";
import handler from "./handler.js";

export default extension => (app, next) => {
  app.register(extension, handler(register({ app, name })));

  return next(app);
};
