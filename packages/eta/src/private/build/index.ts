import name from "#name";
import type { BuildAppHook } from "@primate/core/hook";
import compile from "@primate/core/frontend/compile";
import server from "./server.js";

export default (extension: string): BuildAppHook => async (app, next) => {
  app.register(extension, {
    ...await compile({
      extension,
      name,
      compile: { server },
    }),
  });

  return next(app);
};
