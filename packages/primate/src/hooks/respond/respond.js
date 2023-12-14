import { Blob } from "rcompat/fs";
import { URL } from "rcompat/http";
import { text, json, stream, redirect } from "primate";
import is_response_duck from "./duck.js";

const is_text = value => {
  if (typeof value === "string") {
    return text(value);
  }
  throw new Error(`no handler found for ${value}`);
};

const is_non_null_object = value => typeof value === "object" && value !== null;
const is_object = value => is_non_null_object(value)
  ? json(value) : is_text(value);
const is_response = value => is_response_duck(value)
  ? _ => value : is_object(value);
const isStream = value => value instanceof ReadableStream
  ? stream(value) : is_response(value);
const is_blob = value => value instanceof Blob
  ? stream(value) : isStream(value);
const is_URL = value => value instanceof URL
  ? redirect(value.href) : is_blob(value);
const guess = value => is_URL(value);

export default result => typeof result === "function" ? result : guess(result);
