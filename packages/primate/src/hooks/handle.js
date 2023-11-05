import { Response, Status, MediaType } from "rcompat/http";
import { cascade, tryreturn } from "rcompat/async";
import { respond } from "./respond/exports.js";
import { invalid } from "./route.js";
import { error as clientError } from "../handlers/exports.js";
import _errors from "../errors.js";
const { NoFileForPath } = _errors;

const guard_error = Symbol("guard_error");
const guard = (app, guards) => async (request, next) => {
  // handle guards
  try {
    guards.every(guard => {
      const result = guard(request);
      if (result === true) {
        return true;
      }
      const error = new Error();
      error.result = result;
      error.type = guard_error;
      throw error;
    });

    return next(request);
  } catch (error) {
    if (error.type === guard_error) {
      return (await respond(error.result))(app);
    }
    // rethrow if not guard error
    throw error;
  }
};

export default app => {
  const { config: { http: { static: { root } }, location } } = app;

  const as_route = async request => {
    const { pathname } = request.url;
    // if NoFileForPath is thrown, this will remain undefined
    let error_handler = app.error.default;

    return tryreturn(async _ => {
      const { path, guards, errors, layouts, handler } = invalid(pathname)
        ? NoFileForPath.throw(pathname, location.static)
        : await app.route(request);
      error_handler = errors?.at(-1);

      const pathed = { ...request, path };

      const hooks = [...app.modules.route, guard(app, guards)];

      // handle request
      const response = (await cascade(hooks, handler))(pathed);
      return (await respond(await response))(app, {
        layouts: await Promise.all(layouts.map(layout => layout(request))),
      }, pathed);
    }).orelse(async error => {
      app.log.auto(error);

      // the +error.js page itself could fail
      return tryreturn(_ => respond(error_handler(request))(app, {}, request))
        .orelse(_ => clientError()(app, {}, request));
    });
  };

  const as_asset = async path => new Response(path.stream(), {
    status: Status.OK,
    headers: {
      "Content-Type": MediaType.resolve(path.name),
      Etag: await path.modified(),
    },
  });

  const client = app.runpath(location.client);
  const handle = async request => {
    const { pathname } = request.url;
    if (pathname.startsWith(root)) {
      const debased = pathname.replace(root, _ => "");
      // try static first
      const asset = client.join(location.static, debased);
      if (await asset.isFile) {
        return as_asset(asset);
      }
      const path = client.join(debased);
      if (await path.isFile) {
        return as_asset(path);
      }
    }
    return as_route(request);
  };

  return cascade(app.modules.handle, handle);
};
