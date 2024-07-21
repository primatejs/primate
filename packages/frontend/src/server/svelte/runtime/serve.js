import handler from "@primate/frontend/base/handler";
import { name } from "@primate/frontend/svelte/common";
import client from "../client/default.js";
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
