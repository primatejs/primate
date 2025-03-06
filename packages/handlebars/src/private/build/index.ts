import name from "#name";
import compile from "@primate/core/frontend/compile";
import type { BuildAppHook } from "@primate/core/hook";
import server from "./server.js";

export default (extension: string): BuildAppHook => async (app, next) => {
  app.register(extension, {
    ...compile({
      extension,
      name,
      compile: { server },
    }),
  });

  return next(app);
};
