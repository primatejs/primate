import {Response, Status} from "runtime-compat/http";
import {tryreturn} from "runtime-compat/flow";
import {mime, isResponse, respond} from "./respond/exports.js";
import {invalid} from "./route.js";
import {error as clientError} from "../handlers/exports.js";
import errors from "../errors.js";

const guardError = Symbol("guardError");

export default app => {
  const {config: {http, build}, paths} = app;

  const run = async request => {
    const {pathname} = request.url;
    const {path, guards, layouts, handler} = invalid(pathname)
      ? errors.NoFileForPath.throw(pathname, paths.static)
      : await app.route(request);

    // handle guards
    try {
      guards.map(guard => {
        const result = guard(request);
        if (result === true) {
          return undefined;
        }
        const error = new Error();
        error.result = result;
        error.type = guardError;
        throw error;
      });
    } catch (error) {
      if (error.type === guardError) {
        return (await respond(error.result))(app);
      }
      // rethrow if not guard error
      throw error;
    }

    // handle request
    const handlers = [...app.modules.route, handler]
      .reduceRight((chain, next) => input => next(input, chain));

    return (await respond(await handlers({...request, path})))(app, {
      layouts: await Promise.all(layouts.map(layout => layout(request))),
    });
  };

  const route = async request =>
    tryreturn(async _ => {
      const response = await run(request);
      return isResponse(response) ? response : new Response(...response);
    }).orelse(async error => {
      app.log.auto(error);
      return new Response(...await clientError()(app, {}));
    });

  const asset = async file => new Response(file.readable, {
    status: Status.OK,
    headers: {
      "Content-Type": mime(file.name),
      Etag: await file.modified,
    },
  });

  const handle = async request => {
    const {pathname} = request.url;
    const {root} = http.static;
    if (pathname.startsWith(root)) {
      const debased = pathname.replace(root, _ => "");
      // try static first
      const _static = paths.client.join(build.static, debased);
      if (await _static.isFile) {
        return asset(_static.file);
      }
      const _app = app.paths.client.join(debased);
      return await _app.isFile ? asset(_app.file) : route(request);
    }
    return route(request);
  };

  return [...app.modules.handle, handle]
    .reduceRight((acc, handler) => input => handler(input, acc));
};
