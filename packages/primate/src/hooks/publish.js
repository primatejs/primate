import {Path} from "runtime-compat/fs";
import {cascade} from "runtime-compat/async";
import copy_includes from "./copy_includes.js";

const post = async app => {
  const {build: {paths: {client}}, config, paths} = app;
  const {root} = config.http.static;
  const {build} = config;
  {
    // after hook, publish a zero assumptions app.js (no css imports)
    const src = new Path(root, build.index);

    await app.publish({
      code: app.exports.filter(({type}) => type === "script")
        .map(({code}) => code).join(""),
      src,
      type: "module",
    });

    if (await paths.components.exists) {
      // copy .js files from components to build/client/components
      await app.copy(paths.components, client.join(config.paths.components));
    }

    const imports = {...app.importmaps, app: src.path};
    await app.publish({
      inline: true,
      code: JSON.stringify({imports}, null, 2),
      type: "importmap",
    });
  }

  if (await paths.static.exists) {
    // copy static files to build/static
    await app.transcopy(await paths.static.collect());

    // publish JavaScript and CSS files
    const imports = await Path.collect(paths.static, /\.(?:js|css)$/u);
    await Promise.all(imports.map(async file => {
      const code = await file.text();
      const src = `/${file.name}`;
      const type = file.extension === ".css" ? "style" : "module";
      // already copied in `app.transcopy`
      await app.publish({src, code, type, copy: false});
      type === "style" && app.export({type,
        code: `import "../${config.paths.static}${src}";`});
    }));
  }

  // copy additional subdirectories to build/client
  await copy_includes(app, "client", async to =>
    Promise.all((await to.collect(/\.js$/u)).map(async script => {
      const src = new Path(root, script.path.replace(`${client}`, () => ""));
      await app.publish({src, code: await script.text(), type: "module"});
    }))
  );

  return app;
};

export default async app => post(await cascade(app.modules.publish)(app));
