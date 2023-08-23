import {Path} from "runtime-compat/fs";
import esbuild from "esbuild";

export default () => ({
  name: "primate:esbuild",
  async bundle(app, next) {
    const {config: {location, http}} = app;

    if (app.exports.length > 0) {
      while (app.assets.length > 0) {
        app.assets.pop();
      }
      const client = app.runpath(location.client);
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
        outdir: `${app.path.build.join(location.static)}`,
        logLevel: app.debug ? "warning" : "error",
        external: ["*.woff2", "*.png", "*.jpg"],
      });
      // remove unbundled client
      await client.file.remove();
      const re = new RegExp(`${location.static}/app-.*\\.(?:js|css)$`, "u");
      for (const path of await app.path.build.join(location.static)
        .collect(re, {recursive: false})) {
        const code = await path.text();
        const src = path.name;
        const type = path.extension === ".css" ? "style" : "module";
        await app.publish({src, code, type});
        if (path.extension === ".js") {
          const imports = {app: new Path(http.static.root, src).path};
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
