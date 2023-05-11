import {serve, Response} from "runtime-compat/http";
import {InternalServerError} from "./http-statuses.js";
import {register, compile, publish, bundle, route, handle, parse}
  from "./hooks/exports.js";

export default async (app, operations = {}) => {
  // register handlers
  await register({...app, register(name, handler) {
    app.handlers[name] = handler;
  }});

  // compile server-side code
  await compile(app);
  // publish client-side code
  await publish(app);

  // bundle client-side code
  await bundle(app, operations?.bundle);

  const _route = route(app);

  serve(async request => {
    try {
      // parse, handle
      return await handle({...app, route: _route})(await parse(request));
    } catch(error) {
      app.log.auto(error);
      return new Response(null, {status: InternalServerError});
    }
  }, app.config.http);
};
