import { serve, Response, Status } from "rcompat/http";
import { tryreturn } from "rcompat/async";
import { bold, blue, dim } from "rcompat/colors";
import { resolve } from "rcompat/package";
import o from "rcompat/object";
import Build from "rcompat/build";
import { File } from "rcompat/fs";
import * as hooks from "./hooks/exports.js";
import { print } from "./Logger.js";

const base_hooks = ["init", "stage", "register", "publish"];

const publish = async app => {
  const location = app.get("location");
  const http = app.get("http");
  const client = app.runpath(app.get("location.client"));

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

export default async ($app, mode = "development") => {
  let app = $app;

  app.mode = mode;
  app.build = new Build({
    ...o.exclude(app.get("build"), ["includes", "index", "transform"]),
    outdir: app.runpath(app.get("location.client")).path,
    resolveDir: app.root.path,
  }, mode);

  const primate = await resolve(import.meta.url);
  print(blue(bold(primate.name)), blue(primate.version), "in startup\n");

  for (const hook of base_hooks) {
    app.log.info(`running ${dim(hook)} hooks`, { module: "primate" });
    app = await hooks[hook](app);
  }

  // start the build
  await app.build.start();
  await publish(app);
  app.route = hooks.route(app);
  app.parse = hooks.parse(app);
  const handle = await hooks.handle(app);
  app.server = await serve(async request =>
    tryreturn(async _ => handle(await app.parse(request)))
      .orelse(error => {
        app.log.auto(error);
        return new Response(null, { status: Status.INTERNAL_SERVER_ERROR });
      }), app.get("http"));

  const { host, port } = app.get("http");
  const address = `http${app.secure ? "s" : ""}://${host}:${port}`;
  print(`${blue("++")} started ${dim("->")} ${dim(address)}\n`);
};
