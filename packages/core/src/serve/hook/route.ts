import mismatched_body from "#error/mismatched-body";
import no_route_to_path from "#error/no-route-to-path";
import Body from "@rcompat/http/body";
import entries from "@rcompat/record/entries";
import tryreturn from "@rcompat/sync/tryreturn";
import type { RequestFacade, Route, RouteSpecial } from "#serve";
import type { ServeApp } from "#serve/app";


const deroot = (pathname: string) => pathname.endsWith("/") && pathname !== "/"
  ? pathname.slice(0, -1) 
  : pathname;
// remove excess slashes
const deslash = (url: string) => url.replaceAll(/\/{2,}/gu, _ => "/");

const normalize = (pathname: string) => deroot(deslash(pathname));

const parse_body = (request: Request, url: URL) =>
  tryreturn(async () => await Body.parse(request) ?? {})
    .orelse(error => mismatched_body(url.pathname, (error as any).message));

export default async (app: ServeApp, facade: RequestFacade) => {
  const { request, url } = facade;

  const $request_body_parse = app.config("request.body.parse");
  const $location = app.config("location");

  const index = (path: string) => `${$location.routes}${path === "/" ? "/index" : path}`; 

  const pathname = normalize(url.pathname);
  const route = app.router.match(request) ?? 
    no_route_to_path(request.method.toLowerCase(), pathname, index(pathname));
  const matched = route as Exclude<ReturnType<typeof app.router.match>, undefined>;
  const { params: path } = matched;

  const local_parse_body = matched.file.body?.parse ?? $request_body_parse;
  const body = local_parse_body ? await parse_body(request, url) : null;
  const { guards = [], errors = [], layouts = [] } = entries(matched.specials)
    .map(([key, value]) => [`${key}s`, value]).get();

  const handler = matched.file.default[request.method.toLowerCase() as keyof Route["default"]];

  return {
    body,
    path,
    guards: guards as RouteSpecial[],
    errors: errors as RouteSpecial[],
    layouts: layouts as RouteSpecial[],
    handler,
  };
};
