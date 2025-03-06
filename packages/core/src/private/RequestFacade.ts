import type Body from "#Body";
import type Dictionary from "@rcompat/record/Dictionary";

export default interface RequestFacade {
  request: Request;
  url: URL;
  query: Dictionary;
  headers: Headers;
  cookies: Dictionary;
  path: Dictionary;
  pass(to: string): Promise<Response>,
  body?: Body;
  session?: Dictionary;
}
