import {Path} from "runtime-compat/fs";
import esbuild from "esbuild";

export default () => ({
  name: "@primate/esbuild",
  async bundle(app, next) {
    const {paths: {client, build}, config} = app;
    if (app.entrypoints.length > 0) {
      while (app.assets.length > 0) {
        app.assets.pop();
      }
      const dist = app.entrypoints.map(({code}) => code).join("");
      await esbuild.build({
        stdin: {
          contents: dist,
          resolveDir: `${client.join(app.config.build.app)}`,
        },
        entryNames: "app-[hash]",
        bundle: true,
        minify: true,
        format: "esm",
        outdir: `${build}`,
        logLevel: app.debug ? "warning" : "error",
        external: ["*.woff2", "*.png", "*.jpg"],
      });
      await client.join(config.build.app).file.remove();
      await client.join(config.build.modules).file.remove();
      for (const f of await build.collect(/\.(?:js|css)$/u, {recursive: false})) {
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
