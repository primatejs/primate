import { Path } from "runtime-compat/fs";
import { cascade } from "runtime-compat/async";
import { stringify } from "runtime-compat/object";
import copy_includes from "./copy_includes.js";

const post = async app => {
  const { config: { location, http: { static: { root } } }, path } = app;

  {
    // after hook, publish a zero assumptions app.js (no css imports)
    const src = new Path(root, app.config.build.index);

    await app.publish({
      code: app.exports.filter(({ type }) => type === "script")
        .map(({ code }) => code).join(""),
      src,
      type: "module",
    });

    if (await path.components.exists) {
      // copy .js files from components to build/client/components, since
      // frontend frameworks handle non-js files
      const to = Path.join(location.client, location.components);
      await app.stage(path.components, to, /^.*.js$/u);
    }

    const imports = { ...app.importmaps, app: src.path };
    const type = "importmap";
    await app.publish({ inline: true, code: stringify({ imports }), type });
  }

  if (await path.static.exists) {
    // copy static files to build/client/static
    await app.stage(path.static, new Path(location.client, location.static));

    // publish JavaScript and CSS files
    const imports = await Path.collect(path.static, /\.(?:js|css)$/u);
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

  // copy additional subdirectories to build/client
  const client = app.runpath(location.client);
  await copy_includes(app, location.client, async to =>
    Promise.all((await to.collect(/\.js$/u)).map(async script => {
      const src = new Path(root, script.path.replace(client, _ => ""));
      await app.publish({ src, code: await script.text(), type: "module" });
    })),
  );

  return app;
};

export default async app =>
  post(await (await cascade(app.modules.publish))(app));
