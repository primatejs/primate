import { Path } from "runtime-compat/fs";
import esbuild from "esbuild";

const default_options = {
  entryNames: "app-[hash]",
  bundle: true,
  format: "esm",
};

export default ({
  ignores = [],
  options = {},
} = {}) => ({
  name: "primate:esbuild",
  async bundle(app, next) {
    const { config: { location, http } } = app;
    const production = app.mode === "production";

    if (app.exports.length > 0) {
      while (app.assets.length > 0) {
        app.assets.pop();
      }
      const client = app.runpath(location.client);
      await client.join(app.library).file.remove();
      const directory = `${client}`;
      const contents = app.exports.map(({ code }) => code).join("");
      // remove .js and .css files from static
      await esbuild.build({
        ...default_options,
        stdin: {
          contents,
          resolveDir: directory,
        },
        splitting: production,
        minify: production,
        outdir: directory,
        logLevel: app.debug ? "warning" : "error",
        external: ignores.map(ignore => `*.${ignore}`),
        ...options,
      });
      // remove unbundled client
      const re = new RegExp(`${location.client}/app-.*\\.(?:js|css)$`, "u");
      for (const path of await client.collect(re, { recursive: false })) {
        const code = await path.text();
        const src = path.name;
        const type = path.extension === ".css" ? "style" : "module";
        await app.publish({ src, code, type });
        if (path.extension === ".js") {
          const imports = { app: new Path(http.static.root, src).path };
          await app.publish({
            inline: true,
            code: JSON.stringify({ imports }, null, 2),
            type: "importmap",
          });
        }
      }
    }
    return next(app);
  },
});
