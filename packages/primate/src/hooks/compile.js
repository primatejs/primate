import { Path } from "runtime-compat/fs";
import { cascade } from "runtime-compat/async";
import copy_includes from "./copy_includes.js";
import cwd from "../cwd.js";

const html = /^.*.html$/u;
const defaults = cwd(import.meta, 2).join("defaults");

const pre = async app => {
  const { config: { location }, path } = app;

  // remove build directory in case exists
  if (await path.build.exists) {
    await path.build.file.remove();
  }
  await Promise.all(["server", "client", "components", "pages"]
    .map(directory => app.runpath(directory).file.create()));

  // copy framework pages
  await app.stage(defaults, location.pages, html);
  // overwrite transformed pages to build
  await path.pages.exists && await app.stage(path.pages, location.pages, html);

  if (await path.components.exists) {
    // copy all files to build/components
    await app.stage(path.components, location.components);
    // copy .js files from components to build/server, since frontend
    // frameworks handle non-js files
    const to = Path.join(location.server, location.components);
    await app.stage(path.components, to, /^.*.js$/u);
  }

  if (await path.static.exists) {
    // copy static files to build/server/static
    await app.stage(path.static, new Path(location.server, location.static));
  }

  // copy additional subdirectories to build/server
  await copy_includes(app, location.server);

  return app;
};

export default async app =>
  (await cascade(app.modules.compile))(await pre(app));
