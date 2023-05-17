import {serve, Response} from "runtime-compat/http";
import {InternalServerError} from "./http-statuses.js";
import * as hooks from "./hooks/exports.js";

const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];

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

  const server = await serve(async request => {
    try {
      // parse, handle
      return await hooks.handle(app)(await app.parse(request));
    } catch(error) {
      console.log("TEST2");
      app.log.auto(error);
      return new Response(null, {status: InternalServerError});
    }
  }, app.config.http);

  await [...filter("serve", app.modules), _ => _]
    .reduceRight((acc, handler) => input => handler(input, acc))({
      ...app, server,
    });
};
