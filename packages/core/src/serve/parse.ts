import type { RequestFacade } from "#serve";
import type RequestInit from "#RequestInit";

export default (request: Request): RequestFacade => {
  const { headers, body, method } = request;

  const url = new URL(request.url);

  return {
    request,
    url,
    query: Object.fromEntries(url.searchParams),
    headers,
    cookies: Object.fromEntries(headers.get("cookie")?.split(";").map(cookie =>
      cookie.trim().split("=")) ?? []),
    path: {},
    pass(to: string) {
      const input = `${to}${url.pathname}`;

      return fetch(input, { headers, method, body, duplex: "half" } as RequestInit);
    },
  };
};
