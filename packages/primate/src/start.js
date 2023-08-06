import {serve, Response, Status} from "runtime-compat/http";
import {cascade, tryreturn} from "runtime-compat/async";
import * as hooks from "./hooks/exports.js";

export default async (app, deactivated = []) => {
  // run one-time hooks
  await cascade(["init", "register", "compile", "publish", "bundle"]
    .filter(hook => !deactivated.includes(hook))
    .map(hook => async (input, next) => {
      app.log.info(`running ${hook} hooks`, {module: "primate"});
      return next(await hooks[hook](input));
    }))(app);

  const server = await serve(async request =>
    tryreturn(async _ => hooks.handle(app)(await app.parse(request)))
      .orelse(error => {
        app.log.auto(error);
        return new Response(null, {status: Status.INTERNAL_SERVER_ERROR});
      }),
  app.config.http);

  await cascade(app.modules.serve)({...app, server});
};
