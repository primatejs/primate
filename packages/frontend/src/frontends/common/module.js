import { File } from "rcompat/fs";
import o from "rcompat/object";
import handler from "./handler.js";
import compile from "./compile.js";
import normalize from "./normalize.js";
import peers from "./peers.js";
import depend from "../depend.js";

let spa_exported = false;

export default async ({
  name,
  dependencies,
  default_extension,
}) => {
  const normalized = normalize(name);
  const base = new File(import.meta.url).up(2).join(name);
  const exports_path = base.join("client", "exports.js");
  const imports_path = base.join("imports.js");
  const on = o.filter(peers, ([key]) => dependencies.includes(key));

  return ({
    extension = default_extension,
    // active SPA browsing
    spa = true,
  } = {}) => {
    let imports, exports;

    return {
      name: `primate:${name}`,
      async init(app, next) {
        await depend(on, `frontend:${name}`);

        imports = await imports_path.import();
        exports = await exports_path.import();

        return next(app);
      },
      async publish(app, next) {
        app.build.register(imports.publish(app, extension));
        // export spa only once, regardless of how many frontends use it
        if (!spa_exported) {
          app.export({
            type: "script",
            code: "export { default as spa } from \"@primate/frontend/spa\";\n",
          });
          spa_exported = true;
        }
        return next(app);
      },
      async register(app, next) {
        await imports.prepare(app);

        app.register(extension, {
          handle: handler({
            app,
            name,
            render: imports.render,
            client: exports.default,
            normalize: normalized,
            spa,
          }),
          compile: await compile({
            app,
            extension,
            name,
            create_root: exports.create_root,
            normalize: normalized,
            compile: imports.compile,
          }),
        });

        return next(app);
      },
    };
  };
};
