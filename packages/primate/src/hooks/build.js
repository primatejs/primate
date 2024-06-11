import { cascade } from "rcompat/async";
import Build from "rcompat/build";
import { dim } from "rcompat/colors";
import { File } from "rcompat/fs";
import * as O from "rcompat/object";
import * as P from "rcompat/package";
import * as loaders from "../loaders/exports.js";
import copy_includes from "./copy_includes.js";
import $router from "./router.js";

const html = /^.*.html$/u;

const pre = async (app, mode) => {
  app.log.system(`starting ${dim(mode)} build`);

  app.build = new Build({
    ...O.exclude(app.get("build"), ["includes", "index", "transform"]),
    outdir: app.runpath(app.get("location.client")).path,
    stdin: {
      resolveDir: app.root.path,
    },
  }, mode);

  // remove build directory in case exists
  await app.path.build.remove();
  await app.path.build.create();
  await Promise.all(["server", "client", "pages", "components"]
    .map(directory => app.runpath(directory).create()));
  const components = await app.path.components.collect();
  for (const component of components) {
    const base = `${component.path}`.replace(app.path.components, "").slice(1);
    const to = app.runpath(app.get("location.components"), base);
    await to.directory.create();
  }

  const router = await $router(app.path.routes);
  const layout = { depth: router.depth("layout") };
  app.set("layout", layout);

  return { ...app, layout };
};

const post = async app => {
  const location = app.get("location");
  const { path } = app;
  const defaults = (await P.root(import.meta.url)).join("src/defaults");

  // stage routes
  if (await path.routes.exists()) {
    await app.stage(path.routes, location.routes);
  }
  if (await app.path.types.exists()) {
    await app.stage(path.types, location.types);
  }

  const user_types = await loaders.types(app.log, app.runpath(location.types));
  const types = { ...app.types, ...user_types };

  const directory = app.runpath(location.routes);
  for (const path of await directory.collect()) {
    await app.extensions[path.extension]
      ?.route(directory, path.debase(`${directory}/`), types);
  }
  // copy framework pages
  await app.stage(defaults, location.pages, html);
  // overwrite transformed pages to build
  if (await path.pages.exists()) {
    await app.stage(path.pages, location.pages, html);
  }

  if (await path.static.exists()) {
    // copy static files to build/server/static
    await app.stage(path.static, File.join(location.server, location.static));

    // copy static files to build/client/static
    await app.stage(path.static, File.join(location.client, location.static));

    // publish JavaScript and CSS files
    const imports = await File.collect(path.static, /\.(?:css)$/u);
    await Promise.all(imports.map(async file => {
      const src = file.debase(path.static);
      app.build.export(`import "./${location.static}${src}";`);
    }));
  }

  // copy additional subdirectories to build/server
  await copy_includes(app, location.server);

  const components = await app.path.components.collect();

  // from the build directory, compile to server and client
  await Promise.all(components.map(component => app.compile(component)));

  // start the build
  await app.build.start();

  app.log.system(`build written to ${dim(app.path.build)}`);

  return app;
};

export default async (app, mode = "development") =>
  post(await (await cascade(app.modules.build))(await pre(app, mode)));
