import {Response, URL} from "runtime-compat/http";
import {error as clientError} from "../handlers/exports.js";
import {statuses, mime, isResponse, respond} from "./handle/exports.js";
import fromNull from "../fromNull.js";
import {invalid} from "./route.js";

const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];

const contents = {
  "application/x-www-form-urlencoded": body =>
    fromNull(Object.fromEntries(body.split("&").map(part => part.split("=")
      .map(subpart => decodeURIComponent(subpart).replaceAll("+", " "))))),
  "application/json": body => JSON.parse(body),
};

export default async app => {
  const {http} = app.config;

  const _respond = async request => {
    const csp = Object.keys(http.csp).reduce((policy_string, key) =>
      `${policy_string}${key} ${http.csp[key]};`, "");
    const scripts = app.resources
      .map(resource => `'${resource.integrity}'`).join(" ");
    const _csp = scripts === "" ? csp : `${csp}script-src 'self' ${scripts};`;
    // remove inline resources
    for (let i = app.resources.length - 1; i >= 0; i--) {
      const resource = app.resources[i];
      if (resource.inline) {
        app.resources.splice(i, 1);
      }
    }

    const headers = {
      "Content-Security-Policy": _csp,
      "Referrer-Policy": "same-origin",
    };

    if (invalid(request.url.pathname)) {
      app.log.warn(`no file at ${request.url.pathname}`);
      return clientError()(app, {});
    }

    try {
      const modules = filter("route", app.modules);
      // app.route is the last module to be executed
      const handlers = [...modules, app.route].reduceRight((acc, handler) =>
        input => handler(input, acc));
      return await respond(await handlers(request))(app, headers);
    } catch (error) {
      app.log.auto(error);
      return clientError()(app, headers);
    }
  };

  const route = async request => {
    const response = await _respond(request);
    return isResponse(response) ? response : new Response(...response);
  };

  const staticResource = async file => new Response(file.readable, {
    status: statuses.OK,
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
        status: statuses.OK,
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
    try {
      return await resource(request);
    } catch (error) {
      app.log.auto(error);
      return new Response(null, {status: statuses.InternalServerError});
    }
  };

  const parseContentType = (contentType, body) => {
    const type = contents[contentType];
    return type === undefined ? body : type(body);
  };

  const parseContent = (request, body) => {
    try {
      return parseContentType(request.headers.get("content-type"), body);
    } catch (error) {
      app.log.warn(error);
      return body;
    }
  };

  const decoder = new TextDecoder();

  const parseBody = async request => {
    if (request.body === null) {
      return null;
    }
    const reader = request.body.getReader();
    const chunks = [];
    let result;
    do {
      result = await reader.read();
      if (result.value !== undefined) {
        chunks.push(decoder.decode(result.value));
      }
    } while (!result.done);

    return parseContent(request, chunks.join());
  };

  const parseRequest = async request => {
    const cookies = request.headers.get("cookie");
    const _url = request.url;
    const url = new URL(_url.endsWith("/") ? _url.slice(0, -1) : _url);

    return {
      original: request,
      url,
      body: await parseBody(request),
      cookies: fromNull(cookies === null
        ? {}
        : Object.fromEntries(cookies.split(";").map(c => c.trim().split("=")))),
      headers: fromNull(Object.fromEntries(request.headers)),
      query: fromNull(Object.fromEntries(url.searchParams)),
    };
  };

  // handle is the last module to be executed
  const handlers = [...filter("handle", app.modules), handle]
    .reduceRight((acc, handler) => input => handler(input, acc));

  return async request => handlers(await parseRequest(request));
};
