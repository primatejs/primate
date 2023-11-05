import { Path } from "rcompat/fs";
import { filter } from "rcompat/object";
import handler from "./handler.js";
import compile from "./compile.js";
import normalize from "./normalize.js";
import peers from "./peers.js";
import depend from "../depend.js";

export default async ({
  name,
  dependencies,
  default_extension,
}) => {
  const normalized = normalize(name);
  const exports_path = new Path("..", name, "client", "exports.js");
  const imports_path = new Path("..", name, "imports.js");
  const on = filter(peers, ([key]) => dependencies.includes(key));

  return ({ extension = default_extension } = {}) => {
    let imports, exports;

    return {
      name: `primate:${name}`,
      async init(app, next) {
        await depend(on, `frontend:${name}`);

        imports = await import(imports_path);
        exports = await import(exports_path);

        return next(app);
      },
      async register(app, next) {
        await imports.prepare(app);

        app.register(extension, {
          handle: handler({
            app,
            rootname: exports.rootname,
            render: imports.render,
            client: exports.default,
            normalize: normalized,
          }),
          compile: await compile({
            app,
            extension,
            rootname: exports.rootname,
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
