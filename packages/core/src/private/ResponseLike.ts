import type ResponseFunction from "#ResponseFunction";
import type Dictionary from "@rcompat/record/Dictionary";
import type MaybePromist from "pema/MaybePromise";

type ResponseLike = MaybePromise<
  string |
  Dictionary |
  URL |
  ReadableStream |
  Blob |
  Response |
  ResponseFunction |
  /*throws*/void>;

export { ResponseLike as default };
