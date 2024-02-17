import { URL, Body } from "rcompat/http";
import o from "rcompat/object";
import { tryreturn } from "rcompat/async";
import errors from "../errors.js";

const deslash = url => url.replaceAll(/(?<!http:)\/{2,}/gu, _ => "/");

const get_body = (request, url) =>
  tryreturn(async _ => await Body.parse(request) ?? {})
    .orelse(error => errors.MismatchedBody.throw(url.pathname, error.message));

export default app => async original => {
  const { headers } = original;

  const url = new URL(deslash(globalThis.decodeURIComponent(original.url)));
  const cookies = headers.get("cookie");

  return { original, url,
    body: app.get("request.body.parse") ? await get_body(original, url) : {},
  ...o.valmap({
    query: [o.from(url.searchParams), url.search],
    headers: [o.from(headers), headers, false],
    cookies: [o.from(cookies?.split(";").map(cookie =>
      cookie.trim().split("=")) ?? []), cookies],
  }, value => app.dispatch(...value)) };
};
