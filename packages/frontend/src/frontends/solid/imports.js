import {Path} from "runtime-compat/fs";

import {renderToString} from "solid-js/web";
import {transformAsync} from "@babel/core";
import solid from "babel-preset-solid";

import {hydrate} from "./client/exports.js";

export const render = (component, ...args) =>
  ({body: renderToString(() => component(...args))});

export const compile = {
  async server(text) {
    const presets = [[solid, {generate: "ssr", hydratable: true}]];
    return (await transformAsync(text, {presets})).code;
  },
  async client(text) {
    const presets = [[solid, {generate: "dom", hydratable: true}]];
    return {js: (await transformAsync(text, {presets})).code};
  },
};

const depend = async (module, app, copy_dependency) => {
  const {library, manifest} = app;
  const {http: {static: {root}}} = app.config;

  const parts = module.split("/");
  const path = [library, ...parts];
  const pkg = await Path.resolve().join(...path, manifest).json();
  if (copy_dependency) {
    const dependency = Path.resolve().join(...path);
    const to = app.runpath(app.config.location.client, library, ...parts);
    await dependency.file.copy(`${to}`);
  }

  const entry = pkg.exports["."].browser.import;
  app.importmaps[module] = new Path(root, library, module, entry).path;
};

export const prepare = async app => {
  // load dependencies
  await depend("solid-js", app, true);
  await depend("solid-js/web", app);

  // export hydration code
  app.export({type: "script", code: hydrate});
};

