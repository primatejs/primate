import dispatch from "#dispatch";
import valmap from "@rcompat/object/valmap";

export default () => async original => {
  const { headers } = original;

  const url = new URL(original.url);
  const cookies = headers.get("cookie");

  return { original, url,
  ...valmap({
    query: [Object.fromEntries(url.searchParams), url.search],
    headers: [Object.fromEntries(headers), headers, false],
    cookies: [Object.fromEntries(cookies?.split(";").map(cookie =>
      cookie.trim().split("=")) ?? []), cookies],
  }, value => dispatch(...value)) };
};
