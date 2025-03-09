import client from "#client";
import name from "#name";
import handler from "@primate/core/frontend/handler";
import type { ServeAppHook } from "@primate/core/hook";
import render from "./render.js";

export default (extension: string, spa: boolean, ssr: boolean): ServeAppHook =>
  (app, next) => {
    app.register(extension, handler({
      app,
      render,
      client,
      name,
      spa,
      ssr,
    }));

    return next(app);
};
