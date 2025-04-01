import name from "#name";
import compile from "@primate/core/frontend/compile";
import type { BuildAppHook } from "@primate/core/hook";
import client from "./client.js";
import publish from "./publish.js";

export default (extension: string): BuildAppHook => async (app, next) => {
  app.register(extension, {
    ...compile({
      extension,
      name,
      compile: { client: client(app, extension) },
    }),
  });

  app.build.plugin(publish(app, extension));

  return next(app);
};
