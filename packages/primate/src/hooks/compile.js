import {is} from "runtime-compat/dyndef";
import {cascade} from "runtime-compat/async";
import copy_includes from "./copy_includes.js";
import cwd from "../cwd.js";

const html = /^.*.html$/u;

const pre = async app => {
  const {build, paths, config} = app;

  // remove build directory in case exists
  if (await paths.build.exists) {
    await paths.build.file.remove();
  }
  await build.paths.server.file.create();
  await build.paths.client.file.create();
  await build.paths.components.file.create();
  await build.paths.pages.file.create();

  const {pages} = paths;
  // copy framework pages
  await app.copy(cwd(import.meta, 2).join("defaults"), build.paths.pages, html);
  // overwrite transformed pages to build
  await pages.exists && await app.transcopy(await pages.collect(html));

  const {components} = paths;
  if (await components.exists) {
    // copy all files to build/components
    await app.copy(components, build.paths.components, /^.*$/u);
    // copy .js files from components to build/server, since frontend
    // frameworks handle non-js files
    await app.copy(components, build.paths.server.join(config.paths.components));
  }

  // copy additional subdirectories to build/server
  await copy_includes(app, "server");

  return app;
};

export default async app => cascade(app.modules.compile)(await pre(app));
