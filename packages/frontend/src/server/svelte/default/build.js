import name from "@primate/frontend/svelte/common/name";
import rootname from "@primate/frontend/svelte/common/rootname";
import depend from "@primate/frontend/common/depend";
import normalize from "@primate/frontend/common/normalize";
import peerdeps from "@primate/frontend/common/peerdeps";
import compile from "@primate/frontend/common/compile";
import * as O from "rcompat/object";
import { server, client } from "./compile.js";
import publish from "./publish.js";
import prepare from "./prepare.js";
import create_root from "../client/create-root.js";

const dependencies = ["svelte"];

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

  app.register(extension, await compile({
    app,
    extension,
    rootname,
    create_root,
    normalize: normalize(name),
    compile: { server, client },
  }));

  app.build.plugin(publish(app, extension));
  const code = "export { default as spa } from '@primate/frontend/spa';";
  app.build.export(code);
  await prepare(app);

  return next(app);
};
