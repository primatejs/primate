import { Blob, s_streamable } from "rcompat/fs";
import { URL, Response } from "rcompat/http";
import { identity } from "rcompat/function";
import { text, json, stream, redirect } from "primate";
import errors from "../errors.js";

const not_found = value => errors.InvalidReturnedBody.throw(value);
const is_text = value => typeof value === "string";
const is_non_null_object = value => typeof value === "object" && value !== null;
const is_instance = of => value => value instanceof of;
const is_response = is_instance(globalThis.Response);
const is_fake_response = is_instance(Response);
const is_streamable =
  value => value instanceof Blob || value?.streamable === s_streamable;

// [if, then]
const guesses = [
  [is_instance(URL), redirect],
  [is_streamable, value => stream(value.stream())],
  [is_instance(ReadableStream), stream],
  [value => is_response(value) || is_fake_response(value), value => _ => value],
  [is_non_null_object, json],
  [is_text, text],
  [not_found, identity],
];

const guess = value => guesses.find(([check]) => check(value))?.[1](value);

export default result => typeof result === "function" ? result : guess(result);
