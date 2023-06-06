import {Response, Status} from "runtime-compat/http";
import {mime, isResponse, respond} from "./handle/exports.js";
import {invalid} from "./route.js";
import {error as clientError} from "../handlers/exports.js";
import errors from "../errors.js";

export default app => {
  const {http} = app.config;

  const run = async (request, headers) => {
    const {pathname} = request.url;
    return invalid(pathname)
      ? errors.NoFileForPath.throw(pathname, app.config.paths.static)
      : (await respond(await app.route(request)))(app, headers);
  };

  const route = async request => {
    const headers = app.generateHeaders();

    try {
      const response = await run(request, headers);
      return isResponse(response) ? response : new Response(...response);
    } catch (error) {
      app.log.auto(error);
      return new Response(...await clientError()(app, {}));
    }
  };

  const assets = {
    async static(file) {
      return new Response(file.readable, {
        status: Status.OK,
        headers: {
          "Content-Type": mime(file.name),
          Etag: await file.modified,
        },
      });
    },
    published(request) {
      const published = app.resources.find(({src, inline}) =>
        !inline && src === request.url.pathname);
      return published === undefined
        ? route(request)
        : new Response(published.code, {
          status: Status.OK,
          headers: {
            "Content-Type": mime(published.src),
            Etag: published.integrity,
          },
        });
    },
  };

  const asset = async request => {
    const {pathname} = request.url;
    const {root} = http.static;
    if (pathname.startsWith(root)) {
      const path = app.paths.client.join(pathname.replace(root, ""));
      return await path.isFile
        ? assets.static(path.file)
        : assets.published(request);
    }
    return route(request);
  };

  return [...app.modules.handle, asset]
    .reduceRight((acc, handler) => input => handler(input, acc));
};
