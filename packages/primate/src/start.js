import {serve, Response, Status} from "runtime-compat/http";
import {tryreturn} from "runtime-compat/flow";
import {identity} from "runtime-compat/function";
import * as hooks from "./hooks/exports.js";

export default async (app, operations = {}) => {
  // register handlers
  await hooks.register({...app, register(name, handler) {
    app.handlers[name] = handler;
  }});

  // compile server-side code
  await hooks.compile(app);
  // publish client-side code
  await hooks.publish(app);

  // bundle client-side code
  await hooks.bundle(app, operations?.bundle);

  const server = await serve(async request =>
    tryreturn(async _ => hooks.handle(app)(await app.parse(request)))
      .orelse(error => {
        app.log.auto(error);
        return new Response(null, {status: Status.InternalServerError});
      }),
  app.config.http);

  await [...app.modules.serve, identity]
    .reduceRight((acc, handler) => input => handler(input, acc))({
      ...app, server,
    });
};
