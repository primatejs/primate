import {serve, Response, Status} from "runtime-compat/http";
import {cascade, tryreturn} from "runtime-compat/async";
import * as hooks from "./hooks/exports.js";

export default async (app$, deactivated = []) => {
  // run one-time hooks
  let app = app$;
  for (const hook of ["init", "register", "compile", "publish", "bundle"]) {
    if (deactivated.includes(hook)) {
      continue;
    }
    app.log.info(`running ${hook} hooks`, {module: "primate"});
    app = await hooks[hook](app);
  }

  app.route = hooks.route(app);
  app.parse = hooks.parse(app.dispatch);

  const server = await serve(async request =>
    tryreturn(async _ => (await hooks.handle(app))(await app.parse(request)))
      .orelse(error => {
        app.log.auto(error);
        return new Response(null, {status: Status.INTERNAL_SERVER_ERROR});
      }),
  app.config.http);

  await (await cascade(app.modules.serve))({...app, server});
};
