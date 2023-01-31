import {ReadableStream} from "runtime-compat/streams";
import {Path, File} from "runtime-compat/filesystem";
import {is} from "runtime-compat/dyndef";
import {http404} from "./handlers/http.js";
import text from "./handlers/text.js";
import json from "./handlers/json.js";
import stream from "./handlers/stream.js";
import RouteError from "./errors/Route.js";

const isText = value => typeof value === "string" ? text`${value}` : http404``;
const isObject = value => typeof value === "object" && value !== null 
  ? json`${value}` : isText(value);
const isStream = value => value instanceof ReadableStream
  ? stream`${value}` : isObject(value);
const isFile = value => value instanceof File
  ? stream`${value}` : isStream(value);
const guess = value => isFile(value);

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
      route.method === method && route.path.test(path)) ?? fallback;

  const router = {
    map: (path, callback) => add("map", path, callback),
    get: (path, callback) => add("get", path, callback),
    post: (path, callback) => add("post", path, callback),
    alias: (key, value) => aliases.push({key, value}),
    process: request => {
      const {method} = request;
      const url = new URL(`https://primatejs.com${request.pathname}`);
      const {pathname, searchParams} = url;
      const params = Object.fromEntries(searchParams);
      const verb = find(method, pathname, {handler: () => http404``});
      const path = pathname.split("/").filter(part => part !== "");
      const named = verb.path?.exec(pathname)?.groups ?? {};

      const result = verb.handler(find("map", pathname)
        .handler({...request, pathname, params, path, named}));

      return typeof result === "function" ? result : guess(result);
    },
  };
  const files = (await Path.list(definitions)).map(route => import(route));
  await Promise.all(files.map(async route => (await route).default(router)));
  return router;
};
