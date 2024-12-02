import dispatch, { type DispatchObject } from "#dispatch";
import valmap from "@rcompat/object/valmap";

export interface ParsedRequest {
  original: Request;
  url: URL;
  query: DispatchObject;
  headers: DispatchObject;
  cookies: DispatchObject;
};

export default async (original: Request): Promise<ParsedRequest> => {
  const { headers } = original;

  const url = new URL(original.url);
  const cookies = headers.get("cookie");

  const dispatched = valmap({
    query: [Object.fromEntries(url.searchParams), url.search],
    headers: [Object.fromEntries(headers), headers, false],
    cookies: [Object.fromEntries(cookies?.split(";").map(cookie =>
      cookie.trim().split("=")) ?? []), cookies],
  }, ([ object, raw, cased ]) => [ object, raw, cased ]); //dispatch(object, raw, cased));

  return { original, url, ...dispatched };
};
