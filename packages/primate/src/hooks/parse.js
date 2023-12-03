import { URL, Body } from "rcompat/http";
import { from, valmap } from "rcompat/object";

const deslash = url => url.replaceAll(/(?<!http:)\/{2,}/gu, _ => "/");

export default dispatch => async original => {
  const { body, headers } = original;
  const url = new URL(deslash(globalThis.decodeURIComponent(original.url)));
  const cookies = headers.get("cookie");

  return { original, url,
    body: await Body.parse(body, headers.get("content-type")) ?? {},
    ...valmap({
      query: [from(url.searchParams), url.search],
      headers: [from(headers), headers, false],
      cookies: [from(cookies?.split(";").map(cookie =>
        cookie.trim().split("=")) ?? []), cookies],
    }, value => dispatch(...value)),
  };
};
