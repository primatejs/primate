import { Response, Status, MediaType, fetch } from "rcompat/http";
import { cascade, tryreturn } from "rcompat/async";
import respond from "./respond.js";
import { error as clientError } from "../handlers.js";

const guard_error = Symbol("guard_error");
const guard = (app, guards) => async (request, next) => {
  // handle guards
  try {
    for (const guard of guards) {
      const result = await guard(request);
      if (result !== true) {
        const error = new Error();
        error.result = result;
        error.type = guard_error;
        throw error;
      }
    }

    return next(request);
  } catch (error) {
    if (error.type === guard_error) {
      return { response: respond(error.result)(app) };
    }
    // rethrow if not guard error
    throw error;
  }
};

const get_layouts = async (layouts, request) => {
  const stop_at = layouts.findIndex(({ recursive }) => recursive === false);
  return Promise.all(layouts
    .slice(stop_at === -1 ? 0 : stop_at)
    .map(layout => layout.default(request)));
};
// last handler, preserve final request form
const last = handler => async request => {
  const response = await handler(request);
  return { request, response };
};

export default app => {
  const route = request => app.route(request);

  const as_route = async request => {
    // if tryreturn throws, this will default
    let error_handler = app.error.default;

    return tryreturn(async _ => {
      const { path, guards, errors, layouts, handler } = await route(request);

      error_handler = errors?.at(-1);

      const hooks = [...app.modules.route, guard(app, guards), last(handler)];

      // handle request
      const routed = await (await cascade(hooks))({ ...request, path });

      const $layouts = { layouts: await get_layouts(layouts, routed.request) };
      return respond(routed.response)(app, $layouts, routed.request);
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

  const location = app.get("location");
  const root = app.get("http.static.root");
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
  // first hook
  const pass = (request, next) => next({
    ...request,
    pass(to) {
      const { method, headers, body } = request.original;
      const input = `${to}${request.url.pathname}`;

      return fetch(input, { headers, method, body, duplex: "half" });
    },
  });
  const hotreload = (request, next) => app.mode === "development"
    ? app.build.proxy(request, next)
    : next(request);

  return cascade([pass, hotreload, ...app.modules.handle], handle);
};
