import { normalize, compile } from "../common/exports.js";
import client from "./client/exports.js";

const handler = (name, props = {}, options = {}) => async app => {
  const [component] = name.split(".");
  const assets = [await app.inline(client(component, props), "module")];
  const head = assets.map(asset => asset.head).join("\n");
  const script_src = assets.map(asset => asset.integrity);
  const headers = app.headers({ "script-src": script_src });

  return app.view({ head, headers, body: "", ...options });
};

export default ({
  extension = ".webc",
} = {}) => {
  const name = "webc";
  let imports = {};
  const normalized = normalize(name);

  return {
    name: `primate:${name}`,
    async init(app, next) {
      imports = await import("./imports.js");

      return next(app);
    },
    async publish(app, next) {
      app.build.register(imports.publish(app, extension));
      return next(app);
    },
    async register(app, next) {
      app.register(extension, {
        handle: handler,
        compile: {
          ...await compile({
            app,
            extension,
            name,
            compile: imports.compile,
            normalize: normalized,
          }),
          // noop
          server: _ => _,
        },
      });

      return next(app);
    },
  };
};
