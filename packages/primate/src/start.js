import { serve, Response, Status } from "rcompat/http";
import { tryreturn } from "rcompat/async";
import { bold, blue, dim } from "rcompat/colors";
import * as hooks from "./hooks/exports.js";
import { print } from "./Logger.js";

const base_hooks = ["init", "stage", "register", "publish", "bundle"];

export default async (app$, mode = "development") => {
  app$.mode = mode;
  // run one-time hooks
  let app = app$;

  print(blue(bold(app.name)), blue(app.version), "in startup\n");

  for (const hook of base_hooks) {
    app.log.info(`running ${dim(hook)} hooks`, { module: "primate" });
    app = await hooks[hook](app);
  }

  const http = app.get("http");
  app.route = hooks.route(app);
  app.parse = hooks.parse(app);
  app.server = await serve(async request =>
    tryreturn(async _ => (await hooks.handle(app))(await app.parse(request)))
      .orelse(error => {
        app.log.auto(error);
        return new Response(null, { status: Status.INTERNAL_SERVER_ERROR });
      }), http);

  const address = `http${app.secure ? "s" : ""}://${http.host}:${http.port}`;
  app.log.info(`started at ${dim(address)}`, { module: "primate" });
};
