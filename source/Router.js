import {http404} from "./handlers/http.js";

const aliases = [];
const routes = [];
const dealias = path => aliases.reduce((dealiased, {key, value}) =>
  dealiased.replace(key, () => value), path);
const push = (type, path, handler) =>
  routes.push({type, "path": new RegExp(`^${dealias(path)}$`, "u"), handler});
const find = (type, path, fallback) => routes.find(route =>
  route.type === type && route.path.test(path))?.handler ?? fallback;

export default {
  "map": (path, callback) => push("map", path, callback),
  "get": (path, callback) => push("get", path, callback),
  "post": (path, callback) => push("post", path, callback),
  "alias": (key, value) => aliases.push({key, value}),
  "process": async original_request => {
    const {method} = original_request;
    const url = new URL(`https://primatejs.com${original_request.pathname}`);
    const {pathname, searchParams} = url;
    const params = Object.fromEntries(searchParams);
    const request = {...original_request, pathname, params,
      "path": pathname.split("/").filter(path => path !== ""),
    };
    const verb = find(method, pathname, () => http404``);
    return verb(await find("map", pathname, _ => _)(request));
  },
};
