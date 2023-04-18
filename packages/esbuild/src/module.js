import esbuild from "esbuild";

export default () => ({
  async bundle(app, next) {
    const build = app.root.join("build");
    if (await build.exists) {
      app.log.warn("build folder already exists, bundling disabled");
      return next(app);
    }
    await build.file.create();
    // write all the published resources to the build directory
    for (const resource of app.resources) {
      const {src, code} = resource;
      const filePath = src.replace(app.config.http.static.root, "").split("/");
      const dirPart = filePath.slice(0, -1);
      const directory = dirPart.length > 0 ? build.join(...dirPart) : build;
      const file = directory.join(...filePath.slice(-1));
      if (!await directory.exists) {
        await directory.file.create();
      }
      await file.file.write(code);
    }

    // only bundle if there are entrypoints
    if (app.entrypoints.length > 0) {
      // clear memory resources
      while (app.resources.length > 0) {
        app.resources.pop();
      }
      const dist = app.entrypoints.map(({code}) => code).join("");
      // construct new dist
      const {outputFiles: files} = await esbuild.build({
        stdin: {
          contents: dist,
          resolveDir: `${build}`,
        },
        bundle: true,
        minify: true,
        write: false,
        format: "esm",
        outdir: `${build}`,
        logLevel: app.debug ? "warning" : "error",
      });
      await app.publish({src: "app.js", code: files[0].text, type: "module"});
      await app.publish({src: "app.css", code: files[1].text, type: "style"});
    }
    await build.file.remove();
    return next(app);
  },
});
