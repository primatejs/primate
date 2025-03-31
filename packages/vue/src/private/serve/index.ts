import handler from "./handler.js";
import type { ServeAppHook } from "@primate/core/hook";

export default (extension: string): ServeAppHook => (app, next) => {
  app.register(extension, handler);

  return next(app);
};
