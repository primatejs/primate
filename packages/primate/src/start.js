import { serve, Response, Status } from "rcompat/http";
import { tryreturn } from "rcompat/async";
import { bold, blue, dim } from "rcompat/colors";
import { resolve } from "rcompat/package";
import * as hooks from "./hooks/exports.js";
import { print } from "./Logger.js";

const base_hooks = ["init", "stage", "register", "publish", "bundle"];

export default async (app$, mode = "development") => {
  app$.mode = mode;
  // run one-time hooks
  let app = app$;

  const primate = await resolve(import.meta.url);
  print(blue(bold(primate.name)), blue(primate.version), "in startup\n");

  for (const hook of base_hooks) {
    app.log.info(`running ${dim(hook)} hooks`, { module: "primate" });
    app = await hooks[hook](app);
  }

  app.route = hooks.route(app);
  app.parse = hooks.parse(app);
  app.server = await serve(async request =>
    tryreturn(async _ => (await hooks.handle(app))(await app.parse(request)))
      .orelse(error => {
        app.log.auto(error);
        return new Response(null, { status: Status.INTERNAL_SERVER_ERROR });
      }), app.get("http"));

  const { host, port } = app.get("http");
  const address = `http${app.secure ? "s" : ""}://${host}:${port}`;
  print(`${blue("++")} started ${dim("->")} ${dim(address)}\n`);
};
