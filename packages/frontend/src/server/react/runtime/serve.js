import handler from "@primate/frontend/common/handler";
import normalize from "@primate/frontend/common/normalize";
import name from "@primate/frontend/react/common/name";
import rootname from "@primate/frontend/react/common/rootname";
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
