import {Response, Status} from "runtime-compat/http";
import {tryreturn} from "runtime-compat/flow";
import {mime, isResponse} from "./respond/exports.js";
import {invalid} from "./route.js";
import {error as clientError} from "../handlers/exports.js";
import errors from "../errors.js";

export default app => {
  const {config: {http, build}, paths} = app;

  const run = async (request) => {
    const {pathname} = request.url;
    return invalid(pathname)
      ? errors.NoFileForPath.throw(pathname, paths.static)
      : app.route(request);
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
