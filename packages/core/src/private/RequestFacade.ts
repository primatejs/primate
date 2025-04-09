import type Body from "#Body";
import type Dictionary from "@rcompat/record/Dictionary";
import type PartialDictionary from "@rcompat/record/PartialDictionary";

type PartialStringDictionary = PartialDictionary<string>;

type RequestFacade = Dictionary<Dictionary | unknown> & {
  request: Request;
  url: URL;
  pass(to: string): Promise<Response>,
  headers: PartialStringDictionary;
  query: PartialStringDictionary;
  cookies: PartialStringDictionary;
  path: PartialStringDictionary;
  body?: Body;
};

export { RequestFacade as default };
