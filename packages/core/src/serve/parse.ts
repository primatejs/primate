import type RequestFacade from "#RequestFacade";
import type RequestInit from "#RequestInit";
import type PartialDictionary from "@rcompat/record/PartialDictionary";

export default (request: Request): RequestFacade => {
  const { body, method } = request;

  const url = new URL(request.url);

  const headers = Object.fromEntries(request.headers.entries()) as
    PartialDictionary<string>;

  return {
    request,
    url,
    query: Object.fromEntries(url.searchParams),
    headers,
    cookies: Object.fromEntries(headers.cookie?.split(";").map(cookie =>
      cookie.trim().split("=")) ?? []),
    path: {},
    pass(to: string) {
      const input = `${to}${url.pathname}`;

      return fetch(input, { headers, method, body, duplex: "half" } as RequestInit);
    },
  };
};
