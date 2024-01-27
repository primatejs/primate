import { URL, Body } from "rcompat/http";
import { from, valmap } from "rcompat/object";
import { tryreturn } from "rcompat/async";
import errors from "../errors.js";

const deslash = url => url.replaceAll(/(?<!http:)\/{2,}/gu, _ => "/");

const parse_body = (request, url) =>
  tryreturn(async _ => await Body.parse(request) ?? {})
    .orelse(error => errors.MismatchedBody.throw(url.pathname, error.message));

export default dispatch => async original => {
  const { headers } = original;
  const url = new URL(deslash(globalThis.decodeURIComponent(original.url)));
  const cookies = headers.get("cookie");
  const body = await parse_body(original, url);

  return { original, url, body, ...valmap({
    query: [from(url.searchParams), url.search],
    headers: [from(headers), headers, false],
    cookies: [from(cookies?.split(";").map(cookie =>
      cookie.trim().split("=")) ?? []), cookies],
  }, value => dispatch(...value)) };
};
