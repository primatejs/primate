import * as O from "rcompat/object";
import { tryreturn } from "rcompat/sync";
import { Body } from "rcompat/http";
import { MismatchedBody, MismatchedPath, NoRouteToPath } from "primate/errors";
import validate from "../validate.js";

const deroot = pathname => pathname.endsWith("/") && pathname !== "/"
  ? pathname.slice(0, -1) : pathname;

const parse_body = (request, url) =>
  tryreturn(async _ => await Body.parse(request) ?? {})
    .orelse(error => MismatchedBody.throw(url.pathname, error.message));

export default app => {
  const $request_body_parse = app.get("request.body.parse");
  const $location = app.get("location");

  const index = path => `${$location.routes}${path === "/" ? "/index" : path}`;
  // remove excess slashes
  const deslash = url => url.replaceAll(/\/{2,}/gu, _ => "/");

  return async ({ original, url }) => {
    const pathname = deroot(deslash(url.pathname));
    const route = await app.router.match(original) ?? NoRouteToPath
      .throw(original.method.toLowerCase(), pathname, index(pathname));
    const { params } = route;
    const untyped_path = Object.fromEntries(Object.entries(params)
      .filter(([name]) => !name.includes("="))
      .map(([key, value]) => [key, value]));
    const typed_path = Object.fromEntries(Object.entries(params)
      .filter(([name]) => name.includes("="))
      .map(([name, value]) => [name.split("="), value])
      .map(([[name, type], value]) =>
        tryreturn(_ => {
          validate(app.types[type], value, name);
          return [name, value];
        }).orelse(({ message }) => MismatchedPath.throw(pathname, message))));
    const path = app.dispatch({ ...untyped_path, ...typed_path });
    const local_parse_body = route.file.body?.parse ?? $request_body_parse;
    const body = local_parse_body ? await parse_body(original, url) : null;
    const { guards = [], errors = [], layouts = [] } = O.map(route.specials,
      ([key, value]) => [`${key}s`, value.map(i => i.default)]);
    const handler = route.file.default[original.method.toLowerCase()];

    return { body, path, guards, errors, layouts, handler };
  };
};
