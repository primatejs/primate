import { File } from "rcompat/fs";
import { filter } from "rcompat/object";
import { peers } from "../common/exports.js";
import depend from "../depend.js";

const name = "esbuild";
const dependencies = ["esbuild"];

const publish = async (app, client) => {
  const location = app.get("location");
  const http = app.get("http");

  const re = new RegExp(`${location.client}/app..*(?:js|css)$`, "u");
  for (const path of await client.collect(re, { recursive: false })) {
    const src = path.name;
    const type = path.extension === ".css" ? "style" : "module";
    await app.publish({ src, type });
    if (path.extension === ".js") {
      const imports = { app: File.join(http.static.root, src).path };
      await app.publish({
        inline: true,
        code: JSON.stringify({ imports }, null, 2),
        type: "importmap",
      });
    }
  }
};

const reload = `
  new EventSource("/esbuild")
    .addEventListener("change", () => globalThis.location.reload());`;

export default ({ ignores = [], options = {} } = {}) => {
  const on = filter(peers, ([key]) => dependencies.includes(key));
  const mode = {};
  let esbuild;

  return {
    name: "primate:build",
    async init(app, next) {
      await depend(on, `build:${name}`);
      esbuild = await import("esbuild");
      mode.development = app.mode === "development";
      mode.production = app.mode === "production";

      return next(app);
    },
    handle(request, next) {
      const { method, headers } = request.original;
      const { pathname } = request.url;
      const paths = ["/app.js", "/app.css", "/esbuild"];
      if (mode.development && paths.includes(pathname)) {
        return globalThis.fetch(`http://localhost:6262${pathname}`,
            { headers, method, duplex: "half" });
      }

      return next(request);
    },
    async bundle(app, next) {
      const location = app.get("location");

      if (app.exports.length > 0) {
        const client = app.runpath(location.client);
        await client.join(app.library).remove();
        const { path : resolveDir } = app.root;
        const { path : outdir } = client;
        const contents = app.exports.map(({ code }) => code).join("");
        // remove .js and .css files from static
        const context = await esbuild.context({
          entryNames: mode.development ? "app" : "app-[hash]",
          bundle: true,
          format: "esm",
          stdin: {
            contents,
            resolveDir,
          },
          plugins: app.build.get(),
          splitting: mode.production,
          minify: mode.production,
          outdir,
          logLevel: app.debug ? "warning" : "error",
          external: ignores.map(ignore => `*.${ignore}`),
          banner: mode.development ? { js: reload } : {},
          ...options,
        });
        await context.rebuild();
        // remove unbundled client
        await publish(app, client);

        if (mode.development) {
          await context.watch();

          await context.serve({
            port: 6262,
          });
        }
      }
      return next(app);
    },
  };
};

