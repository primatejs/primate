import {Path} from "runtime-compat/fs";
import esbuild from "esbuild";

export default () => ({
  name: "primate:esbuild",
  async bundle(app, next) {
    const {build, paths, config} = app;
    if (app.exports.length > 0) {
      while (app.assets.length > 0) {
        app.assets.pop();
      }
      await build.paths.client.join(app.library).file.remove();
      const dist = app.exports.map(({code}) => code).join("");
      // remove .js and .css files from static
      await esbuild.build({
        stdin: {
          contents: dist,
          resolveDir: `${build.paths.client}`,
        },
        entryNames: "app-[hash]",
        bundle: true,
        minify: true,
        format: "esm",
        outdir: `${paths.build.join(config.paths.static)}`,
        logLevel: app.debug ? "warning" : "error",
        external: ["*.woff2", "*.png", "*.jpg"],
      });
      // remove unbundled client
      await build.paths.client.file.remove();
      for (const f of await paths.build.join(config.paths.static).collect(/app-.*\.(?:js|css)$/u, {recursive: false})) {
        const code = await f.file.text();
        const src = f.name;
        const type = f.extension === ".css" ? "style" : "module";
        await app.publish({src, code, type});
        if (f.extension === ".js") {
          const imports = {app: new Path(config.http.static.root, src).path};
          await app.publish({
            inline: true,
            code: JSON.stringify({imports}, null, 2),
            type: "importmap",
          });
        }
      }
    }
    return next(app);
  },
});
