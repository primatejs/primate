import name from "#name";
import compile from "@primate/core/frontend/compile";
import type { BuildAppHook } from "@primate/core/hook";
import type { MarkedExtension } from "marked";
import server from "./server.js";

export default (extension: string, options?: MarkedExtension): BuildAppHook =>
  async (app, next) => {
    app.register(extension, {
      ...compile({
        extension,
        name,
        compile: { server: server(options ?? {}) },
      }),
    });

  return next(app);
};
