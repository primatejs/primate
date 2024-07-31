import dispatch from "#dispatch";
import mismatched_body from "#error/mismatched-body";
import mismatched_path from "#error/mismatched-path";
import no_route_to_path from "#error/no-route-to-path";
import validate from "#validate";
import Body from "@rcompat/http/body";
import map from "@rcompat/object/map";
import tryreturn from "@rcompat/sync/tryreturn";

const deroot = pathname => pathname.endsWith("/") && pathname !== "/"
  ? pathname.slice(0, -1) : pathname;

const parse_body = (request, url) =>
  tryreturn(async _ => await Body.parse(request) ?? {})
    .orelse(error => mismatched_body(url.pathname, error.message));

export default app => {
  const $request_body_parse = app.get("request.body.parse");
  const $location = app.get("location");

  const index = path => `${$location.routes}${path === "/" ? "/index" : path}`;
  // remove excess slashes
  const deslash = url => url.replaceAll(/\/{2,}/gu, _ => "/");

  return async ({ original, url }) => {
    const pathname = deroot(deslash(url.pathname));
    const route = await app.router.match(original) ??
      no_route_to_path(original.method.toLowerCase(), pathname, index(pathname));
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
        }).orelse(({ message }) => mismatched_path(pathname, message))));
    const path = dispatch({ ...untyped_path, ...typed_path });
    const local_parse_body = route.file.body?.parse ?? $request_body_parse;
    const body = local_parse_body ? await parse_body(original, url) : null;
    const { guards = [], errors = [], layouts = [] } = map(route.specials,
      ([key, value]) => [`${key}s`, value.map(i => i.default)]);
    const handler = route.file.default[original.method.toLowerCase()];

    return { body, path, guards, errors, layouts, handler };
  };
};
