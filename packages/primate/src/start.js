import { serve, Response, Status } from "rcompat/http";
import { cascade, tryreturn } from "rcompat/async";
import { bold, blue } from "rcompat/colors";
import * as hooks from "./hooks/exports.js";
import { print } from "./Logger.js";

const base_hooks = ["init", "register", "publish", "bundle"];

export default async (app$, mode = "development") => {
  app$.mode = mode;
  // run one-time hooks
  let app = app$;

  const { http } = app.config;
  const address = `http${app.secure ? "s" : ""}://${http.host}:${http.port}`;
  print(blue(bold(app.name)), blue(app.version), `at ${address}\n`);

  app.log.info(`in ${bold(mode)} mode`, { module: "primate" });

  for (const hook of base_hooks) {
    app.log.info(`running ${bold(hook)} hooks`, { module: "primate" });
    app = await hooks[hook](app);
  }

  app.route = hooks.route(app);
  app.parse = hooks.parse(app.dispatch);

  const server = await serve(async request =>
    tryreturn(async _ => (await hooks.handle(app))(await app.parse(request)))
      .orelse(error => {
        app.log.auto(error);
        return new Response(null, { status: Status.INTERNAL_SERVER_ERROR });
      }),
  app.config.http);

  await (await cascade(app.modules.serve))({ ...app, server });
};
