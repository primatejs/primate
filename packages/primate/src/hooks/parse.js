import { URL } from "rcompat/http";
import o from "rcompat/object";

export default app => async original => {
  const { headers } = original;

  const url = new URL(globalThis.decodeURIComponent(original.url));
  const cookies = headers.get("cookie");

  return { original, url,
  ...o.valmap({
    query: [o.from(url.searchParams), url.search],
    headers: [o.from(headers), headers, false],
    cookies: [o.from(cookies?.split(";").map(cookie =>
      cookie.trim().split("=")) ?? []), cookies],
  }, value => app.dispatch(...value)) };
};
