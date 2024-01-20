import { File } from "rcompat/fs";
import { cascade } from "rcompat/async";
import cwd from "../cwd.js";
import copy_includes from "./copy_includes.js";

const html = /^.*.html$/u;
const defaults = cwd(import.meta, 2).join("defaults");

const pre = async app => {
  const { config: { location: { pages, client, components } }, path } = app;

  // copy framework pages
  await app.stage(defaults, pages, html);
  // overwrite transformed pages to build
  await path.pages.exists() && await app.stage(path.pages, pages, html);

  if (await path.components.exists()) {
    // copy .js files from components to build/client/components, since
    // frontend frameworks handle non-js files
    const target = File.join(client, components);
    await app.stage(path.components, target, /^.*.js$/u);
  }

  return app;
};

const post = async app => {
  const { config: { location, http: { static: { root } } }, path } = app;

  if (await path.static.exists()) {
    // copy static files to build/server/static
    await app.stage(path.static, File.join(location.server, location.static));

    // copy static files to build/client/static
    await app.stage(path.static, File.join(location.client, location.static));

    // publish JavaScript and CSS files
    const imports = await File.collect(path.static, /\.(?:js|css)$/u);
    await Promise.all(imports.map(async file => {
      const code = await file.text();
      const src = file.debase(path.static);
      const type = file.extension === ".css" ? "style" : "module";
      // already copied in `app.stage`
      await app.publish({ src, code, type, copy: false });
      type === "style" && app.export({ type,
        code: `import "./${location.static}${src}";` });
    }));
  }

  // copy additional subdirectories to build/server
  await copy_includes(app, location.server);

  // copy additional subdirectories to build/client
  const client = app.runpath(location.client);
  await copy_includes(app, location.client, async to =>
    Promise.all((await to.collect(/\.js$/u)).map(async script => {
      const src = File.join(root, script.path.replace(client, _ => ""));
      await app.publish({ src, code: await script.text(), type: "module" });
    })),
  );

  const components = await app.path.components.collect();

  // from the build directory, compile to server and client
  await Promise.all(components.map(component => app.compile(component)));

  return app;
};

export default async app =>
  post(await (await cascade(app.modules.register))(await pre(app)));
