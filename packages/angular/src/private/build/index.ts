import create_root from "#client/create-root-client";
import expose from "#client/expose";
import name from "#name";
import type { BuildApp } from "@primate/core/build/app";
import type { BuildAppHook } from "@primate/core/hook";
import client from "./client.js";
import publish from "./publish.js";
import server from "./server.js";

const client_root = async (app: BuildApp) => {
  const root = create_root();
  const code = `export { default as root_${name} } from "root:${name}";`;
  app.build.save(`root:${name}`, root);
  app.build.export(code);
};

export default (extension: string): BuildAppHook<true> => async (app, next) => {
  const extensions = {
    from: extension,
    to: ".js",
  };

  app.register(extension, {
    server: component => server(app, component, extensions),
    client: component => client(app, component),
  });

  await client_root(app);
  app.build.plugin(publish(app, extension));
  app.build.export(expose);

  return next(app);
};
