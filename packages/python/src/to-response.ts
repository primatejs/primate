import error from "@primate/core/handler/error";
import redirect from "@primate/core/handler/redirect";
import view from "@primate/core/handler/view";
import type ResponseFunction from "@primate/core/ResponseFunction";
import type ResponseLike from "@primate/core/ResponseLike";
import type Dictionary from "@rcompat/record/Dictionary";
import type { PyProxy } from "pyodide/ffi";
import { unwrap } from "./unwrap.js";

const handlers = { view, redirect, error };

type Handlers = typeof handlers;
type Handler = keyof typeof handlers;

type Handle = {
  [H in Handler]: {
    handler: H;
    params: Parameters<Handlers[H]>;
  }
}[Handler];

const is_handle = (input: Dictionary): input is Handle =>
  typeof input.handler === "string"
  && input.handler in handlers
  && Array.isArray(input.params);

export default (raw_response: PyProxy): ResponseLike => {
  const response = unwrap(raw_response);

  if (is_handle(response)) {
    const { handler, params } = response;

    const h = handlers[handler] as (...args: typeof params) => ResponseFunction;

    return h(...params);
  }

  return response;
};
