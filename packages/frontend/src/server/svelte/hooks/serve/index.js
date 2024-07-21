import handler from "@primate/frontend/base/handler";
import { name } from "@primate/frontend/svelte/common";
import client from "@primate/frontend/svelte/client";
import render from "./render.js";

export default (extension, spa) => (app, next) => {
  app.register(extension, handler({
    app,
    render,
    client,
    name,
    spa,
  }));

  return next(app);
};
