import O from "rcompat/object";

export default app => async original => {
  const { headers } = original;

  const url = new URL(globalThis.decodeURIComponent(original.url));
  const cookies = headers.get("cookie");

  return { original, url,
  ...O.valmap({
    query: [Object.fromEntries(url.searchParams), url.search],
    headers: [Object.fromEntries(headers), headers, false],
    cookies: [Object.fromEntries(cookies?.split(";").map(cookie =>
      cookie.trim().split("=")) ?? []), cookies],
  }, value => app.dispatch(...value)) };
};
