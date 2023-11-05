import { Path } from "rcompat/fs";
import { renderToString } from "solid-js/web";
import { transformAsync } from "@babel/core";
import solid from "babel-preset-solid";

import { expose } from "./client/exports.js";

export const render = (component, props) => {
  const heads = [];
  const push_heads = sub_heads => {
    heads.push(...sub_heads);
  };
  const body = renderToString(() => component({ ...props, push_heads }));

  if (heads.filter(head => head.startsWith("<title")).length > 1) {
    const error = "May only contain one <title> across component hierarchy";
    throw new Error(error);
  }
  const head = heads.join("\n");

  return { body, head };
};

export const compile = {
  async server(text) {
    const presets = [[solid, { generate: "ssr", hydratable: true }]];
    return (await transformAsync(text, { presets })).code;
  },
  async client(text) {
    const presets = [[solid, { generate: "dom", hydratable: true }]];
    return { js: (await transformAsync(text, { presets })).code };
  },
};

const depend = async (module, app, copy_dependency) => {
  const { library, manifest } = app;
  const { http: { static: { root } } } = app.config;

  const parts = module.split("/");
  const path = [library, ...parts];
  const pkg = await Path.resolve().join(...path, manifest).json();
  if (copy_dependency) {
    const dependency = Path.resolve().join(...path);
    const target = app.runpath(app.config.location.client, library, ...parts);
    await dependency.copy(`${target}`);
  }

  const entry = pkg.exports["."].browser.import;
  app.importmaps[module] = new Path(root, library, module, entry).path;
};

export const prepare = async app => {
  // load dependencies
  await depend("solid-js", app, true);
  await depend("solid-js/web", app);

  await app.import("@primate/frontend", "solid");
  // expose code through "app", for bundlers
  await app.export({ type: "script", code: expose });
};

