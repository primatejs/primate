import {Path} from "runtime-compat/fs";
import esbuild from "esbuild";

export default ({
  ignores = [],
} = {}) => ({
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
        outdir: `${client}`,
        logLevel: app.debug ? "warning" : "error",
        external: ignores.map(ignore => `*.${ignore}`),
      });
      // remove unbundled client
      const re = new RegExp(`${location.client}/app-.*\\.(?:js|css)$`, "u");
      for (const path of await client.collect(re, {recursive: false})) {
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
