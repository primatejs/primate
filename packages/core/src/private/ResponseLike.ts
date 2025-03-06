import type MaybePromise from "pema/MaybePromise";
import type ResponseFunction from "#ResponseFunction";

type ResponseLike = MaybePromise<
  string |
  URL |
  ReadableStream |
  Blob |
  Response |
  ResponseFunction |
  /*throws*/void>;

export { ResponseLike as default };
