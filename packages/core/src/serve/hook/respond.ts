import bad_body from "#error/bad-body";
import json from "@primate/core/handler/json";
import redirect from "@primate/core/handler/redirect";
import stream from "@primate/core/handler/stream";
import text from "@primate/core/handler/text";
import streamable from "@rcompat/fs/streamable";
import identity from "@rcompat/function/identity";
import proper from "@rcompat/object/proper";

type Constructor<T> = { new (...args: never): T };
type Streamable<T> = { stream: () => ReadableStream<T> };
type ResponseFunction = (app: unknown, ...rest: unknown[]) => Response

const is_instance = <T>(of: Constructor<T>) => ((value: unknown): value is T => value instanceof of);
const is_response = is_instance(Response);
const is_streamable =
  (value: unknown): value is Streamable<unknown> => value instanceof Blob || (value as Record<PropertyKey, unknown>)?.streamable === streamable;
const is_url = is_instance(URL);
const is_readablestream = is_instance(ReadableStream);

type MatchResult<T extends ReadonlyArray<Function>> = {
  [K in keyof T]:
    readonly [
      T[K],
      T[K] extends (arg: unknown) => arg is infer R ?
        (arg: R) => ResponseFunction :
        T[K] extends (arg: unknown) => boolean ?
          (arg: unknown) => ResponseFunction :
          (...args: unknown[]) => unknown
    ]
}

function match<T extends ReadonlyArray<Function>>(m: MatchResult<T>): MatchResult<T> {
  return m;
}

// [if, then]
const guesses = match([
  [is_url, value => redirect(value.toString())],
  [is_streamable, value => stream(value.stream())],
  [is_readablestream, stream],
  [(value: unknown) => is_response(value), value => _ => value],
  [proper, json],
  [(value: unknown) => typeof value === "string", text],
  [bad_body, identity],
]);

const guess = (value: unknown) => (guesses.find(([check]) => check(value as any))?.[1] as ResponseFunction)(value);

export default (result: unknown) => typeof result === "function" ? result : guess(result);
