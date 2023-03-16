import {Path} from "runtime-compat/filesystem";
import {serve, Response} from "runtime-compat/http";
import statuses from "./http-statuses.json" assert {type: "json"};
import mimes from "./mimes.json" assert {type: "json"};
import {http404} from "./handlers/http.js";
import {isResponse} from "./duck.js";

const regex = /\.([a-z1-9]*)$/u;
const mime = filename => mimes[filename.match(regex)[1]] ?? mimes.binary;

const contents = {
  "application/x-www-form-urlencoded": body =>
    Object.fromEntries(body.split("&").map(part => part.split("=")
      .map(subpart => decodeURIComponent(subpart).replaceAll("+", " ")))),
  "application/json": body => JSON.parse(body),
};

export default env => {
  const route = async request => {
    const csp = Object.keys(env.http.csp).reduce((policy_string, key) =>
      `${policy_string}${key} ${env.http.csp[key]};`, "");
    const headers = {
      "Content-Security-Policy": csp,
      "Referrer-Policy": "same-origin",
    };

    let response;
    try {
      response = await (await env.router.process(request))(env, headers);
    } catch (error) {
      env.error(error.message);
      response = http404(env, headers)``;
    }
    return isResponse(response) ? response : new Response(...response);
  };

  const resource = async file => new Response(file.readable, {
    status: statuses.OK,
    headers: {
      "Content-Type": mime(file.name),
      Etag: await file.modified,
    },
  });

  const _serve = async request => {
    const path = new Path(env.paths.public, request.pathname);
    return await path.isFile ? resource(path.file) : route(request);
  };

  const handle = async request => {
    try {
      return await _serve(request);
    } catch (error) {
      env.error(error.message);
      return new Response(null, {status: statuses.InternalServerError});
    }
  };

  const parseContent = (request, body) => {
    const type = contents[request.headers.get("content-type")];
    return type === undefined ? body : type(body);
  };

  const {http, modules} = env;

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

  env.info(`running on ${http.host}:${http.port}`);
};
