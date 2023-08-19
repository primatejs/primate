import {Path} from "runtime-compat/fs";
import esbuild from "esbuild";

export default () => ({
  name: "primate:esbuild",
  async bundle(app, next) {
    const {path, config} = app;

    if (app.exports.length > 0) {
      while (app.assets.length > 0) {
        app.assets.pop();
      }
      const client = app.runpath(app.config.location.client);
      await client.join(app.library).file.remove();
      const dist = app.exports.map(({code}) => code).join("");
      // remove .js and .css files from static
      await esbuild.build({
        stdin: {
          contents: dist,
          resolveDir: `${client}`,
        },
        entryNames: "app-[hash]",
        bundle: true,
        minify: true,
        format: "esm",
        outdir: `${path.build.join(config.location.static)}`,
        logLevel: app.debug ? "warning" : "error",
        external: ["*.woff2", "*.png", "*.jpg"],
      });
      // remove unbundled client
      await client.file.remove();
      for (const f of await path.build.join(config.location.static)
        .collect(/app-.*\.(?:js|css)$/u, {recursive: false})) {
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
