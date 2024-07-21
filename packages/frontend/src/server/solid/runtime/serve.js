import handler from "@primate/frontend/base/handler";
import normalize from "@primate/frontend/base/normalize";
import { name, rootname } from "@primate/frontend/solid/common";
import render from "./render.js";
import client from "../client/default.js";

export default (extension, spa) => (app, next) => {
  app.register(extension, handler({
    app,
    rootname,
    render,
    client,
    normalize: normalize(name),
    spa,
  }));

  return next(app);
};
