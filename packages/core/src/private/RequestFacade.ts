import type Body from "#Body";
import type Dictionary from "@rcompat/record/Dictionary";

type RequestFacade = Dictionary<Dictionary | unknown> & {
  request: Request;
  url: URL;
  pass(to: string): Promise<Response>,
  headers: Headers;
  query: Dictionary;
  cookies: Dictionary;
  path: Dictionary;
  body?: Body;
  session?: Dictionary;
};

export { RequestFacade as default };
