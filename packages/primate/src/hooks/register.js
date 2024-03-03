import { File } from "rcompat/fs";
import { cascade } from "rcompat/async";
import copy_includes from "./copy_includes.js";

const html = /^.*.html$/u;
const defaults = new File(import.meta.url).up(2).join("defaults");

const pre = async app => {
  const pages = app.get("location.pages");

  // copy framework pages
  await app.stage(defaults, pages, html);
  // overwrite transformed pages to build
  await app.path.pages.exists() && await app.stage(app.path.pages, pages, html);

  return app;
};

const post = async app => {
  const _static = app.path.static;
  const location = app.get("location");

  if (await _static.exists()) {
    // copy static files to build/server/static
    await app.stage(_static, File.join(location.server, location.static));

    // publish JavaScript and CSS files
    const imports = await File.collect(_static, /\.(?:css)$/u);
    await Promise.all(imports.map(async file => {
      const src = file.debase(_static);
      app.build.export(`import "./${location.static}${src}";`);
    }));
  }

  // copy additional subdirectories to build/server
  await copy_includes(app, location.server);

  const components = await app.path.components.collect();

  // from the build directory, compile to server and client
  await Promise.all(components.map(component => app.compile(component)));

  return app;
};

export default async app =>
  post(await (await cascade(app.modules.register))(await pre(app)));
