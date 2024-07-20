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

export default extension => async (app, next) => {
  const normalized = normalize(name);
  const on = O.filter(await peerdeps(), ([key]) => dependencies.includes(key));
  await depend(on, `frontend:${name}`);

  app.register(extension, await compile({
    app,
    extension,
    rootname,
    create_root,
    normalize: normalized,
    compile: { server, client },
  }));

  app.build.plugin(publish(app, extension));
  const code = "export { default as spa } from '@primate/frontend/spa';";
  app.build.export(code);
  await prepare(app);

  return next(app);
};
