import error from "@primate/core/handler/error";
import redirect from "@primate/core/handler/redirect";
import view from "@primate/core/handler/view";
import type { PyProxy } from "pyodide/ffi";
import { unwrap } from "./unwrap.js";
//import ResponseLike from "../../core/src/private/ResponseLike.js";

type ViewParams = {
  name: Parameters<typeof view>[0];
  props: Parameters<typeof view>[1];
  options: Parameters<typeof view>[2];
};

type RedirectParams = {
  location: Parameters<typeof redirect>[0],
  options: Parameters<typeof redirect>[1],
}

type ErrorParams = {
  body: Parameters<typeof error>[0];
  options: Parameters<typeof error>[1];
}

const handlers = {
  view({ name, props = {}, options = {} }: ViewParams) {
    return view(name, props, options);
  },
  redirect({ location, options }: RedirectParams) {
    return redirect(location, options);
  },
  error({ body, options }: ErrorParams) {
    return error(body, options);
  },
};

type Handler = keyof typeof handlers;

const handle_handler = (handler: Handler, args: unknown) =>
  handlers[handler](args as any);

const is_handler = (handler: unknown): handler is Handler =>
  Object.keys(handlers).includes(handler as string);

export default (raw_response: PyProxy): any => {
  const response = unwrap(raw_response);
  const handler = response.__handler__;

  return is_handler(handler)
    ? handle_handler(handler, response) as any
    : response
  ;
};
