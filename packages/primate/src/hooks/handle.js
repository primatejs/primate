import {Response, Status, MediaType} from "runtime-compat/http";
import {cascade, tryreturn} from "runtime-compat/async";
import {respond} from "./respond/exports.js";
import {invalid} from "./route.js";
import {error as clientError} from "../handlers/exports.js";
import _errors from "../errors.js";
const {NoFileForPath} = _errors;

const guardError = Symbol("guardError");

export default app => {
  const {config: {http: {static: {root}}}, location} = app;

  const as_route = async request => {
    const {pathname} = request.url;
    // if NoFileForPath is thrown, this will remain undefined
    let errorHandler = app.error.default;

    return tryreturn(async _ => {
      const {path, guards, errors, layouts, handler} = invalid(pathname)
        ? NoFileForPath.throw(pathname, location.static)
        : await app.route(request);
      errorHandler = errors?.at(-1);

      // handle guards
      try {
        guards.every(guard => {
          const result = guard(request);
          if (result === true) {
            return true;
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
      const response = cascade(app.modules.route, handler)({...request, path});
      return (await respond(await response))(app, {
        layouts: await Promise.all(layouts.map(layout => layout(request))),
      }, request);
    }).orelse(async error => {
      app.log.auto(error);

      // the +error.js page itself could fail
      return tryreturn(_ => respond(errorHandler(request))(app, {}, request))
        .orelse(_ => clientError()(app, {}, request));
    });
  };

  const as_asset = async file => new Response(file.readable, {
    status: Status.OK,
    headers: {
      "Content-Type": MediaType.resolve(file.name),
      Etag: await file.modified,
    },
  });

  const client = app.runpath(app.config.location.client);
  const handle = async request => {
    const {pathname} = request.url;
    if (pathname.startsWith(root)) {
      const debased = pathname.replace(root, _ => "");
      // try static first
      const asset = app.path.build.join(app.config.location.static, debased);
      if (await asset.isFile) {
        return as_asset(asset.file);
      }
      const path = client.join(debased);
      if (await path.isFile) {
        return as_asset(path.file);
      }
    }
    return as_route(request);
  };

  return cascade(app.modules.handle, handle);
};
