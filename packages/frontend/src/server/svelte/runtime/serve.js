import handler from "@primate/frontend/base/handler";
import normalize from "@primate/frontend/base/normalize";
import { name, rootname } from "@primate/frontend/svelte/common";
import client from "../client/default.js";
import render from "./render.js";

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
