import {http404} from "./handlers/http.js";

const aliases = [];
const routes = [];
const dealias = path => aliases.reduce((dealiased, {key, value}) =>
  dealiased.replace(key, () => value), path);
const push = (type, path, handler) =>
  routes.push({type, path: new RegExp(`^${dealias(path)}$`, "u"), handler});
const find = (type, path, fallback = {handler: r => r}) => routes.find(route =>
  route.type === type && route.path.test(path)) ?? fallback;

export default {
  map: (path, callback) => push("map", path, callback),
  get: (path, callback) => push("get", path, callback),
  post: (path, callback) => push("post", path, callback),
  alias: (key, value) => aliases.push({key, value}),
  process: async original_request => {
    const {method} = original_request;
    const url = new URL(`https://primatejs.com${original_request.pathname}`);
    const {pathname, searchParams} = url;
    const params = Object.fromEntries(searchParams);
    const verb = find(method, pathname, {handler: http404``});
    const path = pathname.split("/").filter(path => path !== "");
    Object.entries(verb.path.exec(pathname)?.groups ?? [])
      .filter(([key]) => path[key] === undefined)
      .forEach(([key, value]) => Object.defineProperty(path, key, {value}));

    const request = {...original_request, pathname, params, path};
    return verb.handler(await find("map", pathname).handler(request));
  },
};
