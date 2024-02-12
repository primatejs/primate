import { Blob, s_streamable } from "rcompat/fs";
import { URL, Response } from "rcompat/http";
import { identity } from "rcompat/function";
import { text, json, stream, redirect } from "primate";

const not_found = value => {
  throw new Error(`no handler found for ${value}`);
};
const is_text = value => typeof value === "string";
const is_non_null_object = value => typeof value === "object" && value !== null;
const is_instance = of => value => value instanceof of;
const is_response = is_instance(Response);
const is_global_response = is_instance(globalThis.Response);
const is_streamable =
  value => value instanceof Blob || value?.streamable === s_streamable;

// [if, then]
const guesses = [
  [is_instance(URL), redirect],
  [is_streamable, value => stream(value.stream())],
  [is_instance(ReadableStream), stream],
  [value => is_response(value) || is_global_response(value), identity],
  [is_non_null_object, json],
  [is_text, text],
  [not_found, identity],
];

const guess = value => guesses.find(([check]) => check(value))?.[1](value);

export default result => typeof result === "function" ? result : guess(result);
