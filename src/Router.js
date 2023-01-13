import {ReadableStream} from "runtime-compat/streams";
import {File} from "runtime-compat/filesystem";
import {http404, text, json, stream} from "./handlers/exports.js";
import RouteError from "./errors/Route.js";

const aliases = [];
const routes = [];
const expand = path => aliases.reduce((expanded, {key, value}) =>
  expanded.replace(key, () => value), path);
const exists = (method, path) =>
  routes.some(route => route.method === method && route.path === path);
const add = (method, path, handler) => {
  if (exists(method, path)) {
    throw new RouteError(`a ${method} route for ${path} already exists`);
  }
  routes.push({method, path: new RegExp(`^${expand(path)}$`, "u"), handler});
};
const find = (method, path, fallback = {handler: r => r}) =>
  routes.find(route =>
    route.method === method && route.path.test(path)) ?? fallback;

const isObject = value => typeof value === "object" && value !== null;
const is = {
  text: v => typeof v === "string" ? text`${v}` : http404``,
  object: v => isObject(v) ? json`${v}` : is.text(v),
  stream: v => v instanceof ReadableStream ? stream`${v}` : is.object(v),
  file: v => v instanceof File ? stream`${v}` : is.stream(v),
};
const guess = value => is.file(value);

export default {
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
    Object.entries(verb.path?.exec(pathname)?.groups ?? [])
      .filter(([key]) => path[key] === undefined)
      .forEach(([key, value]) => Object.defineProperty(path, key, {value}));

    const result = verb.handler(find("map", pathname)
      .handler({...request, pathname, params, path}));

    return typeof result === "function" ? result : guess(result);
  },
};
