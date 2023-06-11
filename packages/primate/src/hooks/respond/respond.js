import {Blob} from "runtime-compat/fs";
import {URL} from "runtime-compat/http";
import {text, json, stream, redirect} from "primate";
import {isResponse as isResponseDuck} from "./duck.js";

const isText = value => {
  if (typeof value === "string") {
    return text(value);
  }
  throw new Error(`no handler found for ${value}`);
};

const isNonNullObject = value => typeof value === "object" && value !== null;
const isObject = value => isNonNullObject(value)
  ? json(value) : isText(value);
const isResponse = value => isResponseDuck(value)
  ? _ => value : isObject(value);
const isStream = value => value instanceof ReadableStream
  ? stream(value) : isResponse(value);
const isBlob = value => value instanceof Blob
  ? stream(value) : isStream(value);
const isURL = value => value instanceof URL
  ? redirect(value.href) : isBlob(value);
const guess = value => isURL(value);

export default result => typeof result === "function" ? result : guess(result);
