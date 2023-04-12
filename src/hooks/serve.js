import {Path} from "runtime-compat/fs";
import {serve, Response} from "runtime-compat/http";
import {http404} from "../handlers/http.js";
import {statuses, mimes, isResponse, respond} from "./serve/exports.js";

const regex = /\.([a-z1-9]*)$/u;
const mime = filename => mimes[filename.match(regex)[1]] ?? mimes.binary;

const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];

const contents = {
  "application/x-www-form-urlencoded": body =>
    Object.fromEntries(body.split("&").map(part => part.split("=")
      .map(subpart => decodeURIComponent(subpart).replaceAll("+", " ")))),
  "application/json": body => JSON.parse(body),
};

export default app => {
  const _respond = async request => {
    const csp = Object.keys(app.config.http.csp).reduce((policy_string, key) =>
      `${policy_string}${key} ${app.config.http.csp[key]};`, "");
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

    try {
      const {router} = app;
      const modules = filter("route", app.modules);
      // handle is the last module to be executed
      const handlers = [...modules, router.route].reduceRight((acc, handler) =>
        input => handler(input, acc));
      return await respond(await handlers({request, app}))(app, headers);
    } catch (error) {
      app.log.auto(error);
      return http404()(app, headers);
    }
  };

  const route = async request => {
    const response = await _respond(request);
    return isResponse(response) ? response : new Response(...response);
  };

  const resource = async file => new Response(file.readable, {
    status: statuses.OK,
    headers: {
      "Content-Type": mime(file.name),
      Etag: await file.modified,
    },
  });

  const publishedResource = request => {
    const published = app.resources.find(resource =>
      `/${resource.src}` === request.pathname);
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

  const _serve = async request => {
    const path = new Path(app.paths.public, request.pathname);
    return await path.isFile ? resource(path.file) : publishedResource(request);
  };

  const handle = async request => {
    try {
      return await _serve(request);
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

  const modules = filter("serve", app.modules);

  // handle is the last module to be executed
  const handlers = [...modules, handle].reduceRight((acc, handler) =>
    input => handler(input, acc));

  const decoder = new TextDecoder();
  serve(async request => {
    // preprocess request
    const reader = request.body.getReader();
    const chunks = [];
    let result;
    do {
      result = await reader.read();
      if (result.value !== undefined) {
        chunks.push(decoder.decode(result.value));
      }
    } while (!result.done);

    const body = chunks.length === 0 ? undefined
      : parseContent(request, chunks.join());

    const {pathname, search} = new URL(`https://example.com${request.url}`);

    return handlers({original: request, pathname: pathname + search, body});
  }, app.config.http);
};
