import compile from "@primate/frontend/base/compile";
import depend from "@primate/frontend/base/depend";
import normalize from "@primate/frontend/base/normalize";
import peerdeps from "@primate/frontend/base/peerdeps";
import server_root from "@primate/frontend/base/server-root";
import { name, rootname } from "@primate/frontend/react/common";
import * as O from "rcompat/object";
import create_root from "../client/create-root.js";
import { client, server } from "./compile.js";
import prepare from "./prepare.js";
import publish from "./publish.js";

const dependencies = ["react", "react-dom"];

export default extension => async (app, next) => {
  const on = O.filter(await peerdeps(), ([key]) => dependencies.includes(key));
  await depend(on, `frontend:${name}`);

  // compile server
  await server_root(app, rootname, create_root, server);

  const compiled = await compile({
    app,
    extension,
    rootname,
    create_root,
    normalize: normalize(name),
    compile: { server, client },
  });

  app.register(extension, compiled);

  app.build.plugin(publish(app, extension));
  const code = "export { default as spa } from '@primate/frontend/spa';";
  app.build.export(code);
  await prepare(app);

  return next(app);
};
