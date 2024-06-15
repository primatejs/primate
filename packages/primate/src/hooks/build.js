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
      resolveDir: app.root.build.path,
    },
  }, mode);

  // remove build directory in case exists
  await app.path.build.remove();
  await app.path.build.create();

  await Promise.all(["server", "client", "pages", "components"]
    .map(directory => app.runpath(directory).create()));

  const router = await $router(app.path.routes);
  const layout = { depth: router.depth("layout") };
  app.set("layout", layout);

  return { ...app, layout };
};

const post = async app => {
  const location = app.get("location");
  const defaults = (await P.root(import.meta.url)).join("src/defaults");

  await Promise.all(["routes", "types", "components"].map(directory =>
    app.stage(app.path[directory], location[directory])));

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
  await app.stage(app.path.pages, location.pages, html);

  // copy static files to build/server/static
  await app.stage(app.path.static, File.join(location.server, location.static));

  // copy static files to build/static
  await app.stage(app.path.static, File.join(location.static));

  // publish JavaScript and CSS files
  const imports = await File.collect(app.path.static, /\.(?:css)$/u);
  await Promise.all(imports.map(async file => {
    const src = file.debase(app.path.static);
    app.build.export(`import "./${location.static}${src}";`);
  }));

  // copy additional subdirectories to build/server
  await copy_includes(app, location.server);
  // copy additional subdirectories to build
  await copy_includes(app, "");

  const components = await app.runpath(location.components).collect();

  // from the build directory, compile to server and client
  await Promise.all(components.map(component => app.compile(component)));

  // start the build
  await app.build.start();

  const client = app.runpath(app.get("location.client"));
  const re = /app..*(?:js|css)$/u;

  const $imports = (await client.collect(re, { recursive: false })).map(file => {
    const type = file.extension === ".css" ? "css" : "js";
    const path = `./${file.debase(`${app.path.build}/`)}`;
    return [type, path];
  });

  const build_start_script = `import { init } from "primate";
import config from "./primate.config.js";
import { File } from "rcompat/fs";

import app_html from "./pages/app.html" with { type: "file" };
${$imports.map(([name, path]) =>
    `import ${name} from "${path}" with { type: "file" };`,
  ).join("\n")}
console.log(css);
console.log(js);

const assets = {
  "pages/app.html": await File.text(app_html),
${$imports.map(([name]) => `${name}: await File.text(${name}),`,
  ).join("\n")}
};
console.log(assets)

await init("serve", new File(import.meta.url).directory, config, assets);`;
  await app.path.build.join("start.js").write(build_start_script);
  await app.root.join("primate.config.js")
    .copy(app.path.build.join("primate.config.js"));

  app.log.system(`build written to ${dim(app.path.build)}`);

  return app;
};

export default async (app, mode = "development") =>
  post(await (await cascade(app.modules.build))(await pre(app, mode)));
