import client from "#client";
import name from "#name";
import handler from "@primate/frontend/core/handler";
import render from "./render.js";

export default (extension, spa, ssr) => (app, next) => {
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
