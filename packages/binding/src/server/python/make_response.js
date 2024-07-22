import error from "@primate/core/handlers/error";
import redirect from "@primate/core/handlers/redirect";
import view from "@primate/core/handlers/view";

import { unwrap } from "./unwrap.js";

const handlers = {
  view({ name, props = {}, options = {} }) {
    return view(name, props, options);
  },
  redirect({ location, options }) {
    return redirect(location, options);
  },
  error({ body, options }) {
    return error(body, options);
  },
};

const handle_handler = response => {
  const { __handler__ : handler, ...args } = response;
  return handlers[handler]?.(args) ?? error();
};

const handle_other = response => response;

export default raw_response => {
  const response = unwrap(raw_response);
  return response.__handler__ === undefined
    ? handle_other(response)
    : handle_handler(response);
};
