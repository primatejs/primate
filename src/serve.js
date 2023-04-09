import {Path} from "runtime-compat/fs";
import {serve, Response} from "runtime-compat/http";
import statuses from "./http-statuses.js";
import mimes from "./mimes.js";
import {http404} from "./handlers/http.js";
import {isResponse} from "./duck.js";
import respond from "./respond.js";

const regex = /\.([a-z1-9]*)$/u;
const mime = filename => mimes[filename.match(regex)[1]] ?? mimes.binary;

const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];

const contents = {
  "application/x-www-form-urlencoded": body =>
    Object.fromEntries(body.split("&").map(part => part.split("=")
      .map(subpart => decodeURIComponent(subpart).replaceAll("+", " ")))),
  "application/json": body => JSON.parse(body),
};

export default env => {
  const _respond = async request => {
    const csp = Object.keys(env.http.csp).reduce((policy_string, key) =>
      `${policy_string}${key} ${env.http.csp[key]};`, "");
    const scripts = env.resources
      .map(resource => `'${resource.integrity}'`).join(" ");
    const _csp = scripts === "" ? csp : `${csp}script-src 'self' ${scripts};`;
    // remove inline resources
    for (let i = env.resources.length - 1; i >= 0; i--) {
      const resource = env.resources[i];
      if (resource.inline) {
        env.resources.splice(i, 1);
      }
    }

    const headers = {
      "Content-Security-Policy": _csp,
      "Referrer-Policy": "same-origin",
    };

    try {
      const {router} = env;
      const modules = filter("route", env.modules);
      // handle is the last module to be executed
      const handlers = [...modules, router.route].reduceRight((acc, handler) =>
        input => handler(input, acc));
      return await respond(await handlers({request, env}))(env, headers);
    } catch (error) {
      env.log.error(error);
      return http404()(env, headers);
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
    const published = env.resources.find(resource =>
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
    const path = new Path(env.paths.public, request.pathname);
    return await path.isFile ? resource(path.file) : publishedResource(request);
  };

  const handle = async request => {
    try {
      return await _serve(request);
    } catch (error) {
      env.log.error(error);
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
      env.log.warn(error);
      return body;
    }
  };

  const {http} = env;
  const modules = filter("serve", env.modules);

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
  }, http);

  env.log.info(`running on ${http.host}:${http.port}`);
};
