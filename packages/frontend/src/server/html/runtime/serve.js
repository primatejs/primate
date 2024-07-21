import html_handler from "@primate/frontend/base/html-handler";
import register from "@primate/frontend/base/register";
import { rootname } from "@primate/frontend/html/common";

export default extension => (app, next) => {
  app.register(extension, html_handler(register({ app, rootname })));

  return next(app);
};
