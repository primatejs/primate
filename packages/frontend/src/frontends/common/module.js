import {Path} from "runtime-compat/fs";
import {filter} from "runtime-compat/object";

import handler from "./handler.js";
import compile from "./compile.js";
import publish from "./publish.js";
import normalize from "./normalize.js";
import peers from "./peers.js";

export default async ({
  name,
  dependencies,
  default_extension,
}) => {
  const normalized = normalize(name);
  const exports_path = new Path("..", name, "client", "exports.js");
  const imports_path = new Path("..", name, "imports.js");
  const on = filter(peers, ([key]) => dependencies.includes(key));

  const {rootname, create_root, default: client} = await import(exports_path);
  const imports = await import(imports_path);

  return ({
    directory,
    dynamicProps,
    extension = default_extension,
  } = {}) => {

    return {
      name: `primate:${name}`,
      async init(app, next) {
        await app.depend(on, `frontend:${name}`);

        return next(app);
      },
      async register(app, next) {
        app.register(extension, handler({
          app,
          rootname,
          render: imports.render,
          client,
          normalize: normalized,
        }));

        return next(app);
      },
      async compile(app, next) {
        await compile({
          app,
          directory: directory ?? app.config.location.components,
          extension,
          rootname,
          create_root,
          dynamicProps,
          compile: imports.compile.server,
        });

        return next(app);
      },
      async publish(app, next) {
        await imports.prepare(app);

        await publish({
          app,
          directory: directory ?? app.config.location.components,
          extension,
          rootname,
          create_root,
          dynamicProps,
          normalize: normalized,
          compile: imports.compile.client,
        });

        return next(app);
      },
    };
  };
};
