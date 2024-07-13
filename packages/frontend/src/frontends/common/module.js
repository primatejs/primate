import * as O from "rcompat/object";
import handler from "./handler.js";
import compile from "./compile.js";
import normalize from "./normalize.js";
import peers from "./peers.js";
import depend from "../depend.js";

export default async ({
  name,
  dependencies,
  default_extension,
  imports,
  exports,
}) => {
  const normalized = normalize(name);

  return ({
    extension = default_extension,
    // active SPA browsing
    spa = true,
  } = {}) => {
    return {
      name: `primate:${name}`,
      serve(app, next) {
        app.register(extension, handler({
          app,
          name,
          render: imports.render,
          client: exports.default,
          normalize: normalized,
          spa,
        }));
        return next(app);
      },
      async build(app, next) {
        app.register(extension, await compile({
          app,
          extension,
          name,
          create_root: exports.create_root,
          normalize: normalized,
          compile: imports.compile,
        }));

        const on = O.filter(await peers(),
          ([key]) => dependencies.includes(key));
        await depend(on, `frontend:${name}`);

        app.build.plugin(imports.publish(app, extension));
        const code = "export { default as spa } from '@primate/frontend/spa';";
        app.build.export(code);
        await imports.prepare(app);
        return next(app);
      },
    };
  };
};
