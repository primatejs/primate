import {Path} from "runtime-compat/fs";
import {identity} from "runtime-compat/function";
import copy_includes from "./copy_includes.js"

const post = async app => {
  const {config} = app;
  const build = config.build.app;
  {
    // after hook, publish a zero assumptions app.js (no css imports)
    const code = app.entrypoints.filter(({type}) => type === "script")
      .map(entrypoint => entrypoint.code).join("");
    const src = new Path(config.http.static.root, build, config.build.index);
    await app.publish({src, code, type: "module"});

    await app.copy(app.paths.components, app.paths.client.join(build));

    const imports = {...app.importmaps, app: src.path};
    await app.publish({
      inline: true,
      code: JSON.stringify({imports}, null, 2),
      type: "importmap",
    });
  }

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

  const source = `${app.paths.client}`;
  const {root} = app.config.http.static;
  // copy additional subdirectories to build/client
  await copy_includes(app, "client", async to =>
    Promise.all((await to.collect(/\.js$/u)).map(async script => {
      const code = await script.text();
      const src = new Path(root, script.path.replace(source, () => ""));
      await app.publish({src, code, type: "module"});
    }))
  );
};

export default async app => {
  app.log.info("running publish hooks", {module: "primate"});
  await [...app.modules.publish, identity]
    .reduceRight((acc, handler) => input => handler(input, acc))(app);
  await post(app);
};
