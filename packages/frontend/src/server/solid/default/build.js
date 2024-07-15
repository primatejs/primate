import compile from "@primate/frontend/common/compile";
import depend from "@primate/frontend/common/depend";
import normalize from "@primate/frontend/common/normalize";
import peerdeps from "@primate/frontend/common/peerdeps";
import name from "@primate/frontend/solid/common/name";
import rootname from "@primate/frontend/solid/common/rootname";
import * as O from "rcompat/object";
import create_root from "../client/create-root.js";
import { client, server } from "./compile.js";
import prepare from "./prepare.js";
import publish from "./publish.js";

const dependencies = ["solid-js", "@babel/core", "babel-preset-solid"];

const server_root = async (app, name, create_root, compile) => {
  const filename = `root_${name}.js`;
  const root = await compile(create_root(app.get("layout").depth));
  const path = app.runpath(app.get("location.server"), filename);
  await path.write(root);
  app.roots.push(path);
};

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
