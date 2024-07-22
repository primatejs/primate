import handler from "@primate/frontend/base/handler";
import client from "@primate/frontend/react/client";
import { name } from "@primate/frontend/react/common";
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
