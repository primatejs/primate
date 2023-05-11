import {Response} from "runtime-compat/http";
import {error as clientError} from "../handlers/exports.js";
import {mime, isResponse, respond} from "./handle/exports.js";
import {invalid} from "./route.js";
import errors from "../errors.js";
import {OK} from "../http-statuses.js";

const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];

export default app => {
  const {http} = app.config;

  const _respond = async (request, headers) => {
    if (invalid(request.url.pathname)) {
      errors.NoFileForPath.throw({pathname: request.url.pathname, config: app.config});
      return;
    }
    return respond(await app.route(request))(app, headers);
  };

  const route = async request => {
    const headers = app.generateHeaders();

    try {
      const response = await _respond(request, headers);
      return isResponse(response) ? response : new Response(...response);
    } catch (error) {
      app.log.auto(error);
      return new Response(...await clientError()(app, {}));
    }
  };

  const staticResource = async file => new Response(file.readable, {
    status: OK,
    headers: {
      "Content-Type": mime(file.name),
      Etag: await file.modified,
    },
  });

  const publishedResource = request => {
    const published = app.resources.find(({src, inline}) =>
      !inline && src === request.url.pathname);
    if (published !== undefined) {
      return new Response(published.code, {
        status: OK,
        headers: {
          "Content-Type": mime(published.src),
          Etag: published.integrity,
        },
      });
    }

    return route(request);
  };

  const resource = async request => {
    const {pathname} = request.url;
    const {root} = http.static;
    if (pathname.startsWith(root)) {
      const path = app.paths.public.join(pathname.replace(root, ""));
      return await path.isFile
        ? staticResource(path.file)
        : publishedResource(request);
    }
    return route(request);
  };

  const handle = async request => {
    return await resource(request);
  };

  return [...filter("handle", app.modules), handle]
    .reduceRight((acc, handler) => input => handler(input, acc));
};
