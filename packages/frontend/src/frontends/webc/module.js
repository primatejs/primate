import { normalize, compile, respond } from "../common/exports.js";
import client from "./client/exports.js";

const handler = (name, props = {}, options = {}) =>
  async app => {
    const [component] = name.split(".");
    const assets = [await app.inline(client(component, props), "module")];
    const head = assets.map(asset => asset.head).join("\n");
    const script = assets.map(asset => asset.csp).join(" ");
    const headers = { script };
    const body = "";

    return respond({ app, head, headers, body, options });
  };

export default ({
  extension = ".webc",
} = {}) => {
  const name = "webc";
  const rootname = name;
  let imports = {};
  const normalized = normalize(name);

  return {
    name: `primate:${name}`,
    async init(app, next) {
      imports = await import("./imports.js");

      return next(app);
    },
    async register(app, next) {
      app.register(extension, {
        handle: handler,
        compile: {
          ...await compile({
            app,
            extension,
            rootname,
            compile: imports.compile,
            normalize: normalized,
          }),
        },
      });

      return next(app);
    },
  };
};
