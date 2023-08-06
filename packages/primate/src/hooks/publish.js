import {File, Path} from "runtime-compat/fs";
import {cascade} from "runtime-compat/async";
import copy_includes from "./copy_includes.js";

const post = async app => {
  const {config, paths} = app;
  const build = config.build.app;
  {
    // after hook, publish a zero assumptions app.js (no css imports)
    const code = app.entrypoints.filter(({type}) => type === "script")
      .map(entrypoint => entrypoint.code).join("");
    const src = new Path(config.http.static.root, build, config.build.index);
    await app.publish({src, code, type: "module"});

    if (await paths.components.exists) {
      // copy .js files from components to build/server
      await app.copy(app.paths.components, app.build.paths.client.join(build));
    }

    const imports = {...app.importmaps, app: src.path};
    await app.publish({
      inline: true,
      code: JSON.stringify({imports}, null, 2),
      type: "importmap",
    });
  }

  // copy JavaScript and CSS files from `app.paths.static`
  const imports = await Path.collect(app.paths.static, /\.(?:js|css)$/u);
  await Promise.all(imports.map(async file => {
    const code = await file.text();
    const src = file.name;
    const isCSS = file.extension === ".css";
    await app.publish({src: `${config.build.static}/${src}`, code,
      type: isCSS ? "style" : "module"});
    if (isCSS) {
      app.bootstrap({type: "style",
        code: `import "../${config.build.static}/${file.name}";`});
    }
  }));

  const source = `${app.build.paths.client}`;
  const {root} = app.config.http.static;
  // copy additional subdirectories to build/client
  await copy_includes(app, "client", async to =>
    Promise.all((await to.collect(/\.js$/u)).map(async script => {
      const src = new Path(root, script.path.replace(source, () => ""));
      await app.publish({src, code: await script.text(), type: "module"});
    }))
  );

  if (await paths.static.exists) {
    // copy static files to build/client/static
    await File.copy(paths.static, app.build.paths.client.join(config.build.static));
  }

  return app;
};

export default async app => post(await cascade(app.modules.publish)(app));
