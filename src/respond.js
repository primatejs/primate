import {Blob} from "runtime-compat/fs";
import {text, json, stream} from "./handlers/exports.js";
import {isResponse as isResponseDuck} from "./duck.js";
import RouteError from "./errors/Route.js";

const isText = value => {
  if (typeof value === "string") {
    return text(value);
  }
  throw new RouteError(`no handler found for ${value}`);
};
const isObject = value => typeof value === "object" && value !== null
  ? json(value) : isText(value);
const isResponse = value => isResponseDuck(value)
  ? () => value : isObject(value);
const isStream = value => value instanceof ReadableStream
  ? stream(value) : isResponse(value);
const isBlob = value => value instanceof Blob
  ? stream(value) : isStream(value);
const guess = value => isBlob(value);

export default result => typeof result === "function" ? result : guess(result);
