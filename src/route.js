import {ReadableStream} from "runtime-compat/streams";
import {Blob, Path} from "runtime-compat/filesystem";
import {is} from "runtime-compat/dyndef";
import text from "./handlers/text.js";
import json from "./handlers/json.js";
import stream from "./handlers/stream.js";
import RouteError from "./errors/Route.js";
import {isResponse as isResponseDuck} from "./duck.js";

const isText = value => {
  if (typeof value === "string") {
    return text`${value}`;
  }
  throw new RouteError(`no handler found for ${value}`);
};
const isObject = value => typeof value === "object" && value !== null
  ? json`${value}` : isText(value);
const isResponse = value => isResponseDuck(value)
  ? () => value : isObject(value);
const isStream = value => value instanceof ReadableStream
  ? stream`${value}` : isResponse(value);
const isBlob = value => value instanceof Blob
  ? stream`${value}` : isStream(value);
const guess = value => isBlob(value);

// insensitive-case equal
const ieq = (left, right) => left.toLowerCase() === right.toLowerCase();

export default async definitions => {
  const aliases = [];
  const routes = [];
  const expand = path => aliases.reduce((expanded, {key, value}) =>
    expanded.replace(key, () => value), path);
  const exists = (method, path) =>
    routes.some(route => route.method === method && route.path === path);
  const add = (method, path, handler) => {
    is(path).string();
    is(handler).function();
    if (exists(method, path)) {
      throw new RouteError(`a ${method} route for ${path} already exists`);
    }
    routes.push({method, path: new RegExp(`^${expand(path)}$`, "u"), handler});
  };
  const find = (method, path, fallback = {handler: r => r}) =>
    routes.find(route =>
      ieq(route.method, method) && route.path.test(path)) ?? fallback;

  const router = {
    map: (path, callback) => add("map", path, callback),
    get: (path, callback) => add("get", path, callback),
    post: (path, callback) => add("post", path, callback),
    alias: (key, value) => aliases.push({key, value}),
    process: async request => {
      const {method} = request.original;
      const url = new URL(`https://primatejs.com${request.pathname}`);
      const {pathname, searchParams} = url;
      const params = Object.fromEntries(searchParams);
      const verb = find(method, pathname, {handler: () => {
        throw new RouteError(`no ${method.toUpperCase()} route to ${pathname}`);
      }});
      const path = pathname.split("/").filter(part => part !== "");
      const named = verb.path?.exec(pathname)?.groups ?? {};

      const result = await verb.handler(await find("map", pathname)
        .handler({...request, pathname, params, path, named}));

      return typeof result === "function" ? result : guess(result);
    },
  };
  if (await definitions.exists) {
    const files = (await Path.list(definitions)).map(route => import(route));
    await Promise.all(files.map(async route => (await route).default(router)));
  }
  return router;
};
