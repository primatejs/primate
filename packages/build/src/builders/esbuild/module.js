import { Path, watch } from "rcompat/fs";
import { Response, MediaType, Status } from "rcompat/http";
import { filter } from "rcompat/object";
import { ReadableStream } from "rcompat/streams";
import { peers } from "../common/exports.js";
import depend from "../depend.js";

const name = "esbuild";
const default_options = {
  entryNames: "app-[hash]",
  bundle: true,
  format: "esm",
};
const watch_options = { recursive: true };
const dependencies = ["esbuild"];

const publish = async (app, client) => {
  const { config: { location, http } } = app;

  while (app.assets.length > 0) {
    app.assets.pop();
  }
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
};

const message = new TextEncoder().encode("data: update\n\n");
const clients = [];
const inform = () => {
  clients.forEach(client => {
    client.enqueue(message);
  });
};
let i = -1;
const livereload_url = "/livereload";
const code = `
  const source = new EventSource("${livereload_url}");
  source.addEventListener("message", function(e) {
    globalThis.location.reload();
  });
`;

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
    async handle(request, next) {
      if (mode.development && request.url.pathname === livereload_url) {
        const body = new ReadableStream({
          start(controller) {
            i++;
            clients.push(controller);
          },
          cancel() {
            clients.splice(i--, 1);
          },
        });

        return new Response(body, {
          status: Status.OK,
          headers: {
            "Content-Type": MediaType.TEXT_EVENT_STREAM,
          },
        });
      }

      return next(request);
    },
    async publish(app, next) {
      if (mode.development) {
        app.export({ type: "script", code });
      }

      return next(app);
    },
    async bundle(app, next) {
      const { config: { location } } = app;

      if (app.exports.length > 0) {
        while (app.assets.length > 0) {
          app.assets.pop();
        }
        const client = app.runpath(location.client);
        await client.join(app.library).remove();
        const directory = `${client}`;
        const contents = app.exports.map(({ code }) => code).join("");
        // remove .js and .css files from static
        const context = await esbuild.context({
          ...default_options,
          stdin: {
            contents,
            resolveDir: directory,
          },
          splitting: mode.production,
          minify: mode.production,
          outdir: directory,
          logLevel: app.debug ? "warning" : "error",
          external: ignores.map(ignore => `*.${ignore}`),
          ...options,
        });
        await context.rebuild();
        // remove unbundled client
        await publish(app, client);

        if (mode.development) {
          watch(`${app.path.components}`, watch_options, async (_, filename) => {
            const path = new Path(app.path.components, filename);

            app.log.info(`reloading ${path.name}`, { module: "primate/build" });
            // recompile resource
            await app.compile(path);
            // rebuild server
            await context.rebuild();
            // republish import map
            await publish(app, client);
            // inform clients
            inform();
          });
        }

      }
      return next(app);
    },
  };
};

